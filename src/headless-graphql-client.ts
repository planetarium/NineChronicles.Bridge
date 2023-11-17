import { Address } from "@planetarium/account";
import { BencodexDictionary, Dictionary, decode } from "@planetarium/bencodex";
import { Currency, FungibleAssetValue } from "@planetarium/tx";
import { Client, fetchExchange } from "@urql/core";
import { retryExchange } from "@urql/exchange-retry";
import {
    GetAssetTransferredDocument,
    GetBlockHashDocument,
    GetBlockIndexDocument,
    GetGarageUnloadsDocument,
    GetGenesisHashDocument,
    GetNextTxNonceDocument,
    GetTipIndexDocument,
    GetTransactionResultDocument,
    StageTransactionDocument,
} from "./generated/graphql";
import { IHeadlessGraphQLClient } from "./interfaces/headless-graphql-client";
import { AssetTransferredEvent } from "./types/asset-transferred-event";
import { BlockHash } from "./types/block-hash";
import { GarageUnloadEvent } from "./types/garage-unload-event";
import { TransactionResult } from "./types/transaction-result";
import { TxId } from "./types/txid";

export class HeadlessGraphQLClient implements IHeadlessGraphQLClient {
    private readonly _client: Client;

    constructor(apiEndpoint: string, maxRetry: number) {
        this._client = new Client({
            url: apiEndpoint,
            exchanges: [
                retryExchange({
                    initialDelayMs: 1000,
                    maxDelayMs: 15000,
                    randomDelay: true,
                    maxNumberAttempts: maxRetry,
                    retryWith: (error, operation) => {
                        console.error(error.message);
                        // https://formidable.com/open-source/urql/docs/basics/errors/
                        // This automatically distinguish, log, process Network / GQL error.
                        if (error.networkError) {
                            const context = {
                                ...operation.context,
                                url: apiEndpoint,
                            };
                            return { ...operation, context };
                        }
                    },
                }),
                fetchExchange,
            ],
        });
    }

    async getGarageUnloadEvents(
        blockIndex: number,
        agentAddress: Address,
        avatarAddress: Address,
    ): Promise<GarageUnloadEvent[]> {
        const { data } = await this._client.query(GetGarageUnloadsDocument, {
            startingBlockIndex: blockIndex,
        });

        return data.transaction.ncTransactions
            .map((tx) => {
                const action = decode(
                    Buffer.from(tx.actions[0].raw, "hex"),
                ) as Dictionary;
                const values = (action.get("values") as Dictionary).get("l");
                const recipientAvatarAddress = Address.fromBytes(values[0]);
                const fungibleAssetValues: [Address, FungibleAssetValue][] = (
                    values[1] ?? []
                ).map((args) => [
                    Address.fromBytes(args[0]),
                    {
                        currency: decodeCurrency(args[1][0]),
                        rawValue: args[1][1],
                    },
                ]);
                const fungibleItems: [Address, string, number][] = (
                    values[2] ?? []
                ).map((args) => [
                    recipientAvatarAddress,
                    Buffer.from(args[0]).toString("hex"),
                    args[1],
                ]);
                const memo = values[3];

                return !recipientAvatarAddress.equals(avatarAddress) &&
                    fungibleAssetValues.filter((fav) =>
                        agentAddress.equals(fav[0]),
                    ).length === 0
                    ? null
                    : {
                          txId: tx.id,
                          fungibleAssetValues,
                          fungibleItems,
                          memo,
                      };
            })
            .filter((ev) => ev !== null);
    }

    async getBlockIndex(blockHash: BlockHash): Promise<number> {
        return (
            await this._client.query(GetBlockIndexDocument, { hash: blockHash })
        ).data.chainQuery.blockQuery.block.index;
    }

    async getTipIndex(): Promise<number> {
        return (await this._client.query(GetTipIndexDocument, {})).data
            .nodeStatus.tip.index;
    }

    async getBlockHash(index: number): Promise<BlockHash> {
        return (
            await this._client.query(GetBlockHashDocument, {
                index,
            })
        ).data.chainQuery.blockQuery.block.hash;
    }

    async getAssetTransferredEvents(
        blockIndex: number,
        recipient: Address,
    ): Promise<AssetTransferredEvent[]> {
        const data = await this._client.query(GetAssetTransferredDocument, {
            blockIndex,
        });

        return data.data.transaction.ncTransactions
            .map((tx) => {
                const txId = tx.id;
                const action = decode(
                    Buffer.from(tx.actions[0].raw, "hex"),
                ) as Dictionary;
                const values = action.get("values") as BencodexDictionary;
                const sender = Address.fromBytes(
                    values.get("sender") as Buffer,
                );
                const recipientOnTx = Address.fromBytes(
                    values.get("recipient") as Buffer,
                );
                const memo = values.get("memo") as string;
                const [rawCurrency, rawValue] = values.get("amount") as [
                    BencodexDictionary,
                    bigint,
                ];
                const amount: FungibleAssetValue = {
                    currency: decodeCurrency(rawCurrency),
                    rawValue,
                };

                if (!recipientOnTx.equals(recipient)) {
                    return null;
                }

                return {
                    txId,
                    sender,
                    recipient,
                    amount,
                    memo,
                };
            })
            .filter((ev) => ev !== null);
    }

    async getNextTxNonce(address: string): Promise<number> {
        return (await this._client.query(GetNextTxNonceDocument, { address }))
            .data.nextTxNonce;
    }

    async getGenesisHash(): Promise<string> {
        // substitute with registry? this takes 4 seconds.
        return (await this._client.query(GetGenesisHashDocument, {})).data
            .chainQuery.blockQuery.block.hash;
    }

    async stageTransaction(payload: string): Promise<string> {
        return (
            await this._client.mutation(StageTransactionDocument, { payload })
        ).data.stageTransaction;
    }

    async getTransactionResult(txId: TxId): Promise<TransactionResult> {
        return (
            await this._client.query(GetTransactionResultDocument, { txId })
        ).data.transaction.transactionResult;
    }
}

function decodeCurrency(bdict: BencodexDictionary): Currency {
    const dpAsHex = (bdict.get("decimalPlaces") as Buffer).toString("hex");
    return {
        ticker: bdict.get("ticker").valueOf() as string,
        decimalPlaces: parseInt(`0x${dpAsHex}`),
        totalSupplyTrackable: false,
        minters: (bdict.get("minters")?.valueOf() as Set<Uint8Array>) ?? null,
        maximumSupply: null,
    };
}
