import { Account, Address } from "@planetarium/account";
import { encode } from "@planetarium/bencodex";
import { encodeSignedTx } from "@planetarium/tx";
import { PrismaClient, RequestCategory, RequestType } from "@prisma/client";
import { IHeadlessGraphQLClient } from "../../interfaces/headless-graphql-client";
import { getAssetTransferredEvents } from "../../monitors/assets-transferred-monitor";
import { getTxId } from "../../utils/tx";
import { getNextBlockIndex, getNextTxNonce } from "../utils";
import { responseTransactionsFromTransferEvents } from "./events/transfer";

export async function processDownstreamEvents(
    upstreamAccount: Account,
    downstreamAccount: Account,
    client: PrismaClient,
    upstreamGQLClient: IHeadlessGraphQLClient,
    downstreamGQLClient: IHeadlessGraphQLClient,
    agentAddress: Address,
    defaultStartBlockIndex: bigint,
) {
    const upstreamNetworkId = upstreamGQLClient.getPlanetID();
    const downstreamNetworkId = downstreamGQLClient.getPlanetID();
    const upstreamGenesisHash = Buffer.from(
        await upstreamGQLClient.getGenesisHash(),
        "hex",
    );
    const downstreamGenesisHash = Buffer.from(
        await downstreamGQLClient.getGenesisHash(),
        "hex",
    );

    await client.$transaction(
        async (tx) => {
            const nextBlockIndex = await getNextBlockIndex(
                tx,
                downstreamNetworkId,
                defaultStartBlockIndex,
            );

            const tipIndex = await downstreamGQLClient.getTipIndex();

            if (nextBlockIndex >= tipIndex) {
                console.debug(
                    "[sync][downstream] skip. nextBlockIndex / tipIndex",
                    nextBlockIndex,
                    tipIndex,
                );
                return;
            }

            console.debug("[sync][downstream] nextBlockIndex", nextBlockIndex);
            console.log(
                "[sync][downstream] networkId",
                downstreamGQLClient.getPlanetID(),
            );

            await tx.block.create({
                data: {
                    networkId: downstreamGQLClient.getPlanetID(),
                    index: nextBlockIndex,
                },
            });

            console.debug("[sync][downstream] block row created.");

            const transferAssetEvents = await getAssetTransferredEvents(
                upstreamGQLClient,
                agentAddress,
                Number(nextBlockIndex),
            );

            console.debug(
                "[sync][downstream] transferAssetEvents.length",
                transferAssetEvents.length,
            );
            console.debug(
                "[sync][downstream] transferAssetEvents",
                transferAssetEvents,
            );

            await tx.requestTransaction.createMany({
                data: [
                    ...transferAssetEvents.map((ev) => {
                        return {
                            blockIndex: nextBlockIndex,
                            networkId: downstreamNetworkId,
                            type: RequestType.TRANSFER_ASSET,
                            category: RequestCategory.PROCESS,
                            id: ev.txId,
                        };
                    }),
                ],
            });

            console.debug(
                "[sync][downstream] request transaction rows created.",
            );

            const upstreamNextTxNonce = await getNextTxNonce(
                tx,
                upstreamGQLClient,
                upstreamAccount,
            );
            const downstreamNextTxNonce = await getNextTxNonce(
                tx,
                downstreamGQLClient,
                downstreamAccount,
            );

            console.debug(
                "[sync][downstream] upstreamNextTxNonce",
                upstreamNextTxNonce,
            );
            console.debug(
                "[sync][downstream] downstreamNextTxNonce",
                downstreamNextTxNonce,
            );

            const responseTransactions = [
                ...(await responseTransactionsFromTransferEvents(
                    transferAssetEvents,
                    {
                        account: upstreamAccount,
                        networkId: upstreamNetworkId,
                        genesisHash: upstreamGenesisHash,
                        startNonce: upstreamNextTxNonce,
                    },
                    {
                        account: downstreamAccount,
                        networkId: downstreamNetworkId,
                        genesisHash: downstreamGenesisHash,
                        startNonce: downstreamNextTxNonce,
                    },
                )),
            ];

            console.debug(
                "[sync][downstream] responseTransactions.length",
                responseTransactions.length,
            );
            console.debug(
                "[sync][downstream] responseTransactions",
                responseTransactions,
            );

            await tx.responseTransaction.createMany({
                data: responseTransactions.map(
                    ({ signedTx, requestTxId, type, networkId }) => {
                        const serializedTx = encode(encodeSignedTx(signedTx));
                        const txid = getTxId(serializedTx);
                        return {
                            id: txid,
                            nonce: signedTx.nonce,
                            raw: Buffer.from(serializedTx),
                            type,
                            networkId,
                            requestTransactionId: requestTxId,
                        };
                    },
                ),
            });

            console.debug(
                "[sync][downstream] response transaction rows created.",
            );
        },
        {
            timeout: 60 * 1000,
        },
    );
}
