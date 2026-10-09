import jwt from "jsonwebtoken";
import { getEnv } from "./env";
import { Address } from "@planetarium/account";
import {
    BencodexDictionary,
    Dictionary,
    Value,
    decode,
    isDictionary,
} from "@planetarium/bencodex";
import { Currency, FungibleAssetValue } from "@planetarium/tx";
import { Client, fetchExchange, mapExchange } from "@urql/core";
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
import { AssetTransferredEvent } from "./types/asset-transferred-event";
import { BlockHash } from "./types/block-hash";
import { GarageUnloadEvent } from "./types/garage-unload-event";
import { Planet } from "./types/registry";
import { TransactionResult } from "./types/transaction-result";
import { TxId } from "./types/txid";

export interface IHeadlessGraphQLClient {
    getPlanetID(): string;
    getBlockIndex(blockHash: BlockHash): Promise<number>;
    getTipIndex(): Promise<number>;
    getBlockHash(index: number): Promise<BlockHash>;
    getGarageUnloadEvents(
        blockIndex: number,
        agentAddress: Address,
        avatarAddress: Address,
    ): Promise<GarageUnloadEvent[]>;
    getAssetTransferredEvents(
        blockIndex: number,
        recipient: Address,
    ): Promise<AssetTransferredEvent[]>;
    getNextTxNonce(address: string): Promise<number>;
    getGenesisHash(): Promise<string>;
    stageTransaction(payload: string): Promise<string>;
    getTransactionResult(txId: TxId): Promise<TransactionResult>;
}

function isArray<T>(obj: unknown): obj is T[] {
    return Array.isArray(obj);
}

export class HeadlessGraphQLClient implements IHeadlessGraphQLClient {
    private readonly _client: Client;
    private readonly _planet: Planet;
    private readonly _endpoints: string[];
    private _endpointsIterator: IterableIterator<string>;

    constructor(planet: Planet) {
        this._planet = planet;
        this.randomSortEndpoints();
        this._endpoints = this._planet.rpcEndpoints["headless.gql"];
        this._endpointsIterator = this._endpoints[Symbol.iterator]();
        const endpoint = this.getEndpoint();

        const secretKey = getEnv("NC_JWT_SECRET_KEY");
        const iss = getEnv("NC_JWT_ISS");

        this._client = new Client({
            url: endpoint,
            fetchOptions: () => {
                if (secretKey && iss) {
                    return {
                        headers: {
                            Authorization: `Bearer ${this.generateJwtToken(secretKey, iss)}`,
                        },
                    };
                }
                return {};
            },
            exchanges: [
                retryExchange({
                    initialDelayMs: 1000,
                    maxDelayMs: 10000,
                    randomDelay: true,
                    maxNumberAttempts: Number.POSITIVE_INFINITY,
                    retryWith: (error, operation) => {
                        console.error(error.message);
                        // https://formidable.com/open-source/urql/docs/basics/errors/
                        // This automatically distinguish, log, process Network / GQL error.
                        if (error.networkError) {
                            const fallback = this.getEndpoint();
                            console.log(`Fallback RPC: ${fallback}`);
                            const context = {
                                ...operation.context,
                                url: fallback,
                            };
                            return { ...operation, context };
                        }
                    },
                }),
                fetchExchange,
            ],
        });
        console.log(
            `GQL client initialization complete - ${this._planet.id} - ${endpoint}`,
        );
    }

    private generateJwtToken(secretKey: string, iss: string): string {
        const payload = {
            iss: iss,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 300,
        };

        return jwt.sign(payload, secretKey);
    }

    public getPlanetID(): string {
        return this._planet.id;
    }

    private getEndpoint(): string {
        const nextUrl = this._endpointsIterator.next();
        if (nextUrl.done) {
            // Reset the iterator when it reaches the end
            this._endpointsIterator = this._endpoints[Symbol.iterator]();
            return this.getEndpoint(); // Recursively get the next URL
        }
        return nextUrl.value;
    }

    private randomSortEndpoints() {
        this._planet.rpcEndpoints["headless.gql"] = this._planet.rpcEndpoints[
            "headless.gql"
        ].sort(() => Math.random() - 0.5);
    }

    async getGarageUnloadEvents(
        blockIndex: number,
        agentAddress: Address,
        avatarAddress: Address,
    ): Promise<GarageUnloadEvent[]> {
        const { data } = await this._client.query(GetGarageUnloadsDocument, {
            startingBlockIndex: blockIndex,
        });

        if (!data?.transaction?.ncTransactions) {
            throw new Error("Failed to fetch data through GraphQL.");
        }

        return data.transaction.ncTransactions
            .map((tx) => {
                if (
                    tx === null ||
                    tx.actions.length > 1 ||
                    tx.actions[0] === null
                ) {
                    return null;
                }

                const action = decode(Buffer.from(tx.actions[0].raw, "hex"));
                if (!isDictionary(action)) {
                    return null;
                }

                const values = action.get("values");
                if (!isDictionary(values)) {
                    return null;
                }

                const payload = values.get("l");
                if (!isArray<Value>(payload)) {
                    return null;
                }

                if (
                    !(payload[0] instanceof Uint8Array) ||
                    !(isArray<Value>(payload[1]) || payload[1] === null) ||
                    !(isArray<Value>(payload[2]) || payload[2] === null) ||
                    !(typeof payload[3] === "string" || payload[3] === null)
                ) {
                    return null;
                }

                function isValidFungibleAssetValuePayload(
                    x: Value,
                ): x is [Uint8Array, [BencodexDictionary, bigint]] {
                    return (
                        isArray<Value>(x) &&
                        x[0] instanceof Uint8Array &&
                        isArray<Value>(x[1]) &&
                        isDictionary(x[1][0]) &&
                        typeof x[1][1] === "bigint"
                    );
                }

                function isValidFungibleItemPayload(
                    x: Value,
                ): x is [Uint8Array, bigint] {
                    return (
                        isArray<Value>(x) &&
                        x[0] instanceof Uint8Array &&
                        typeof x[1] === "bigint"
                    );
                }

                const recipientAvatarAddress = Address.fromBytes(payload[0]);
                const fungibleAssetValues: [Address, FungibleAssetValue][] = (
                    payload[1] ?? []
                )
                    .filter(isValidFungibleAssetValuePayload)
                    .map((args: [Uint8Array, [BencodexDictionary, bigint]]) => [
                        Address.fromBytes(args[0]),
                        {
                            currency: decodeCurrency(args[1][0]),
                            rawValue: args[1][1],
                        },
                    ]);
                const fungibleItems: [Address, string, bigint][] = (
                    payload[2] ?? []
                )
                    .filter(isValidFungibleItemPayload)
                    .map((args) => [
                        recipientAvatarAddress,
                        Buffer.from(args[0]).toString("hex"),
                        args[1],
                    ]);
                const memo = payload[3];

                const filteredFungibleAssetValues = fungibleAssetValues.filter(
                    (fav) =>
                        agentAddress.equals(fav[0]) ||
                        avatarAddress.equals(fav[0]),
                );
                const filteredFungibleItems = recipientAvatarAddress.equals(
                    avatarAddress,
                )
                    ? fungibleItems
                    : [];

                return {
                    txId: tx.id,
                    signer: tx.signer,
                    fungibleAssetValues: filteredFungibleAssetValues,
                    fungibleItems: filteredFungibleItems,
                    memo,
                };
            })
            .filter((ev) => ev !== null);
    }

    async getBlockIndex(blockHash: BlockHash): Promise<number> {
        const response = await this._client.query(GetBlockIndexDocument, {
            hash: blockHash,
        });
        const block = response.data?.chainQuery.blockQuery?.block;
        if (!block) {
            throw new Error("Failed to fetch data through GraphQL.");
        }

        return block.index;
    }

    async getTipIndex(): Promise<number> {
        const response = await this._client.query(GetTipIndexDocument, {});
        const tipIndex = response.data?.nodeStatus.tip.index;
        if (!tipIndex) {
            throw new Error("Failed to fetch data through GraphQL.");
        }

        return tipIndex;
    }

    async getBlockHash(index: number): Promise<BlockHash> {
        const response = await this._client.query(GetBlockHashDocument, {
            index,
        });
        const block = response.data?.chainQuery.blockQuery?.block;
        if (!block) {
            throw new Error("Failed to fetch data through GraphQL.");
        }

        return block.hash;
    }

    async getAssetTransferredEvents(
        blockIndex: number,
        recipient: Address,
    ): Promise<AssetTransferredEvent[]> {
        const response = await this._client.query(GetAssetTransferredDocument, {
            blockIndex,
        });

        const transactions = response.data?.transaction.ncTransactions;
        if (!transactions) {
            throw new Error("Invalid operation.");
        }

        return transactions
            .filter((x) => x !== null)
            .filter((x) => x.actions.every((v) => v !== null))
            .map((tx) => {
                const txId = tx.id;
                const actions = tx.actions.filter((x) => x !== null);
                const action = decode(
                    Buffer.from(actions[0].raw, "hex"),
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
        const response = await this._client.query(GetNextTxNonceDocument, {
            address,
        });
        if (!response.data) {
            throw new Error("Failed to fetch data through GraphQL.");
        }

        return response.data.nextTxNonce;
    }

    async getGenesisHash(): Promise<string> {
        if (this._planet.genesisHash) {
            return this._planet.genesisHash;
        }

        const response = await this._client.query(GetGenesisHashDocument, {});

        const hash = response.data?.chainQuery.blockQuery?.block?.hash;
        if (!hash) {
            throw new Error("Failed to fetch data through GraphQL.");
        }

        return hash;
    }

    async stageTransaction(payload: string): Promise<string> {
        const response = await this._client.mutation(StageTransactionDocument, {
            payload,
        });
        const txid = response.data?.stageTransaction;
        if (!txid) {
            throw new Error("Failed to stage transaction.");
        }

        return txid;
    }

    async getTransactionResult(txId: TxId): Promise<TransactionResult> {
        const response = await this._client.query(
            GetTransactionResultDocument,
            { txId },
        );
        if (!response.data) {
            throw new Error("Failed to fetch data through GraphQL.");
        }

        return response.data.transaction.transactionResult;
    }
}

function decodeCurrency(bdict: BencodexDictionary): Currency {
    const dpAsHex = (bdict.get("decimalPlaces") as Buffer).toString("hex");
    const ticker = bdict.get("ticker");
    if (typeof ticker !== "string") {
        throw new TypeError("Invalid ticker. Ticker must be typed as string.");
    }

    return {
        ticker: ticker,
        decimalPlaces: parseInt(`0x${dpAsHex}`),
        totalSupplyTrackable: false,
        minters: (bdict.get("minters")?.valueOf() as Set<Uint8Array>) ?? null,
        maximumSupply: null,
    };
}
