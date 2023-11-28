import { Account, Address } from "@planetarium/account";
import { encode } from "@planetarium/bencodex";
import { encodeSignedTx } from "@planetarium/tx";
import { PrismaClient, RequestCategory, RequestType } from "@prisma/client";
import { IHeadlessGraphQLClient } from "../../interfaces/headless-graphql-client";
import { getAssetTransferredEvents } from "../../monitors/assets-transferred-monitor";
import { getGarageUnloadEvents } from "../../monitors/garage-unload-monitor";
import { getTxId } from "../../utils/tx";
import { getNextBlockIndex, getNextTxNonce } from "../utils";
import { responseTransactionsFromGarageEvents } from "./events/garage";
import { responseTransactionsFromTransferEvents } from "./events/transfer";

export async function processUpstreamEvents(
    downstreamAccount: Account,
    client: PrismaClient,
    upstreamGQLClient: IHeadlessGraphQLClient,
    downstreamGQLClient: IHeadlessGraphQLClient,
    agentAddress: Address,
    avatarAddress: Address,
    defaultStartBlockIndex: bigint,
) {
    const downstreamNetworkId = downstreamGQLClient.getPlanetID();
    const upstreamNetworkId = upstreamGQLClient.getPlanetID();
    const downstreamGenesisHash = Buffer.from(
        await downstreamGQLClient.getGenesisHash(),
        "hex",
    );
    await client.$transaction(async (tx) => {
        const nextBlockIndex = await getNextBlockIndex(
            tx,
                upstreamNetworkId,
            defaultStartBlockIndex,
        );

        await tx.block.create({
            data: {
                networkId: upstreamGQLClient.getPlanetID(),
                index: nextBlockIndex,
            },
        });

        const unloadGarageEvents = await getGarageUnloadEvents(
            upstreamGQLClient,
            agentAddress,
            avatarAddress,
            Number(nextBlockIndex),
        );
        const transferAssetEvents = await getAssetTransferredEvents(
            upstreamGQLClient,
            agentAddress,
            Number(nextBlockIndex),
        );

        await tx.requestTransaction.createMany({
            data: [
                ...unloadGarageEvents.map((ev) => {
                    return {
                        blockIndex: nextBlockIndex,
                        networkId: upstreamNetworkId,
                        type: RequestType.UNLOAD_FROM_MY_GARAGES,
                        category: RequestCategory.PROCESS,
                        id: ev.txId,
                    };
                }),
                ...transferAssetEvents.map((ev) => {
                    return {
                        blockIndex: nextBlockIndex,
                        networkId: upstreamNetworkId,
                        type: RequestType.TRANSFER_ASSET,
                        category: RequestCategory.PROCESS,
                        id: ev.txId,
                    };
                }),
            ],
        });

        const downstreamNextTxNonce = await getNextTxNonce(
            tx,
            downstreamGQLClient,
            downstreamAccount,
        );

        const responseTransactions = [
            ...(await responseTransactionsFromGarageEvents(
                unloadGarageEvents,
                downstreamAccount,
                downstreamNetworkId,
                downstreamGenesisHash,
                downstreamNextTxNonce,
            )),
            ...(await responseTransactionsFromTransferEvents(
                transferAssetEvents,
                downstreamAccount,
                downstreamNetworkId,
                downstreamGenesisHash,
                downstreamNextTxNonce + BigInt(unloadGarageEvents.length),
            )),
        ];

        await tx.responseTransaction.createMany({
            data: responseTransactions.map(
                ({ signedTx, requestTxId, networkId, type }) => {
                    const serializedTx = encode(encodeSignedTx(signedTx));
                    const txid = getTxId(serializedTx);
                    return {
                        id: txid,
                        nonce: signedTx.nonce,
                        raw: Buffer.from(serializedTx),
                        type,
                        networkId: networkId,
                        requestTransactionId: requestTxId,
                    };
                },
            ),
        });
    });
}
