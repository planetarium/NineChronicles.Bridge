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

    await client.$transaction(async (tx) => {
        const nextBlockIndex = await getNextBlockIndex(
            tx,
            defaultStartBlockIndex,
        );

        await tx.block.create({
            data: {
                networkId: upstreamGQLClient.getPlanetID(),
                index: nextBlockIndex,
            },
        });

        const transferAssetEvents = await getAssetTransferredEvents(
            upstreamGQLClient,
            agentAddress,
            Number(nextBlockIndex),
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
    });
}
