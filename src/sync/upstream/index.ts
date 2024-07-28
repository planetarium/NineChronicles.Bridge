import { Account, Address } from "@planetarium/account";
import { encode } from "@planetarium/bencodex";
import { encodeSignedTx } from "@planetarium/tx";
import { PrismaClient, RequestCategory, RequestType } from "@prisma/client";
import { getAssetTransferredEvents } from "../../events/assets-transferred";
import {
    ValidatedGarageUnloadEvent,
    getGarageUnloadEvents,
} from "../../events/garage-unload";
import { IHeadlessGraphQLClient } from "../../headless-graphql-client";
import { SlackBot } from "../../slack/bot";
import { BridgeErrorEvent } from "../../slack/messages/bridge-error-event";
import { BridgeEvent } from "../../slack/messages/bridge-event";
import { delay } from "../../utils/delay";
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
    slackBot: SlackBot | null,
) {
    const downstreamNetworkId = downstreamGQLClient.getPlanetID();
    const upstreamNetworkId = upstreamGQLClient.getPlanetID();
    const downstreamGenesisHash = Buffer.from(
        await downstreamGQLClient.getGenesisHash(),
        "hex",
    );
    const [isSkipped, responseTransactions] =
        await client.$transaction(
            async (tx) => {
                const nextBlockIndex = await getNextBlockIndex(
                    tx,
                    upstreamNetworkId,
                    defaultStartBlockIndex,
                );

                const tipIndex = await upstreamGQLClient.getTipIndex();

                if (nextBlockIndex >= tipIndex) {
                    console.debug(
                        "[sync][upstream] skip. nextBlockIndex / tipIndex",
                        nextBlockIndex,
                        tipIndex,
                    );
                    return [true, [], []];
                }

                console.debug(
                    "[sync][upstream] nextBlockIndex",
                    nextBlockIndex,
                );
                console.log(
                    "[sync][upstream] networkId",
                    upstreamGQLClient.getPlanetID(),
                );

                await tx.block.create({
                    data: {
                        networkId: upstreamGQLClient.getPlanetID(),
                        index: nextBlockIndex,
                    },
                });

                console.debug("[sync][upstream] block row created.");

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

                console.debug(
                    "[sync][upstream] unloadGarageEvents.length",
                    unloadGarageEvents.length,
                );
                console.debug(
                    "[sync][upstream] unloadGarageEvents",
                    unloadGarageEvents,
                );
                console.debug(
                    "[sync][upstream] transferAssetEvents.length",
                    transferAssetEvents.length,
                );
                console.debug(
                    "[sync][upstream] transferAssetEvents",
                    transferAssetEvents,
                );

                await tx.requestTransaction.createMany({
                    data: [
                        ...unloadGarageEvents.map((ev) => {
                            return {
                                blockIndex: nextBlockIndex,
                                networkId: upstreamNetworkId,
                                sender: Address.fromHex(
                                    ev.signer,
                                    true,
                                ).toString(),
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
                                sender: ev.sender.toString(),
                                category: RequestCategory.PROCESS,
                                id: ev.txId,
                            };
                        }),
                    ],
                });

                console.debug(
                    "[sync][upstream] request transaction rows created.",
                );

                const downstreamNextTxNonce = await getNextTxNonce(
                    tx,
                    downstreamGQLClient,
                    downstreamAccount,
                );

                console.debug(
                    "[sync][upstream] downstreamNextTxNonce",
                    downstreamNextTxNonce,
                );

                const responseTransactions = [
                    ...(await responseTransactionsFromGarageEvents(
                        unloadGarageEvents,
                        downstreamAccount,
                        downstreamNetworkId,
                        downstreamGenesisHash,
                        downstreamNextTxNonce,
                        {
                            agentAddress,
                            avatarAddress,
                        },
                    )),
                    ...(await responseTransactionsFromTransferEvents(
                        transferAssetEvents,
                        downstreamAccount,
                        downstreamNetworkId,
                        downstreamGenesisHash,
                        downstreamNextTxNonce +
                            BigInt(unloadGarageEvents.length),
                    )),
                ];

                console.debug(
                    "[sync][upstream] responseTransactions.length",
                    responseTransactions.length,
                );
                console.debug(
                    "[sync][upstream] responseTransactions",
                    responseTransactions,
                );

                const responseTransactionsDBPayload = responseTransactions.map(
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
                );
                await tx.responseTransaction.createMany({
                    data: responseTransactionsDBPayload,
                });

                console.debug(
                    "[sync][upstream] response transaction rows created.",
                );

                return [
                    false,
                    responseTransactionsDBPayload,
                ];
            },
            {
                timeout: 60 * 1000,
            },
        );

    if (isSkipped) {
        await delay(1000);
    }

    for (const responseTransaction of responseTransactions) {
        await slackBot?.sendMessage(
            new BridgeEvent(
                responseTransaction.type,
                [upstreamNetworkId, responseTransaction.requestTransactionId],
                [responseTransaction.networkId, responseTransaction.id],
                "NOT_SUPPORTED_FOR_RDB",
                "NOT_SUPPORTED_FOR_RDB",
            ),
        );
    }
}
