import { Account, Address } from "@planetarium/account";
import { encode } from "@planetarium/bencodex";
import { encodeSignedTx } from "@planetarium/tx";
import { PrismaClient, RequestCategory, RequestType } from "@prisma/client";
import { IHeadlessGraphQLClient } from "../../interfaces/headless-graphql-client";
import { getAssetTransferredEvents } from "../../monitors/assets-transferred-monitor";
import {
    ValidatedGarageUnloadEvent,
    getGarageUnloadEvents,
} from "../../monitors/garage-unload-monitor";
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
                return;
            }

            console.debug("[sync][upstream] nextBlockIndex", nextBlockIndex);
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
            const unloadGarageEventsWithValidMemo = unloadGarageEvents.filter(
                (ev) => isValidParsedMemo(ev.parsedMemo),
            );
            const unloadGarageEventsWithInvalidMemo = unloadGarageEvents.filter(
                (ev) => !isValidParsedMemo(ev.parsedMemo),
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
                    ...unloadGarageEventsWithValidMemo.map((ev) => {
                        return {
                            blockIndex: nextBlockIndex,
                            networkId: upstreamNetworkId,
                            sender: Address.fromHex(ev.signer, true).toString(),
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

            console.debug("[sync][upstream] request transaction rows created.");

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
                    unloadGarageEventsWithValidMemo,
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

            console.debug(
                "[sync][upstream] responseTransactions.length",
                responseTransactions.length,
            );
            console.debug(
                "[sync][upstream] responseTransactions",
                responseTransactions,
            );

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

            console.debug(
                "[sync][upstream] response transaction rows created.",
            );
        },
        {
            timeout: 60 * 1000,
        },
    );
}

function isValidParsedMemo(
    parsedMemo: ValidatedGarageUnloadEvent["parsedMemo"],
): boolean {
    return (
        checkError(() => Address.fromHex(parsedMemo.agentAddress, true)) &&
        checkError(() => Address.fromHex(parsedMemo.avatarAddress, true)) &&
        typeof parsedMemo.memo === "string"
    );
}

// If the given function throws error, it returns false.
// If not, it returns true.
function checkError(fn: () => void) {
    try {
        fn();
        return true;
    } catch {
        return false;
    }
}
