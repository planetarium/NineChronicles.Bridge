import axios, { AxiosResponse } from "axios";
import { IHeadlessGraphQLClient } from "./interfaces/headless-graphql-client";
import { BlockHash } from "./types/block-hash";
import { GarageUnloadEvent } from "./types/garage-unload-event";
import { BencodexDictionary, Dictionary, Value, decode, encode } from "@planetarium/bencodex";
import { Address } from "@planetarium/account";
import { Currency, FungibleAssetValue } from "@planetarium/tx";
import { AssetTransferredEvent } from "./types/asset-transferred-event";

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

interface GraphQLRequestBody {
    operationName: string | null;
    query: string;
    variables: Record<string, unknown>;
}

export class HeadlessGraphQLClient implements IHeadlessGraphQLClient {
    private readonly _apiEndpoint: string;
    private readonly _maxRetry: number;

    constructor(apiEndpoint: string, maxRetry: number) {
        this._apiEndpoint = apiEndpoint;
        this._maxRetry = maxRetry;
    }

    async getGarageUnloadEvents(blockIndex: number, agentAddress: Address, avatarAddress: Address): Promise<GarageUnloadEvent[]> {
        const query = `query GetGarageUnloads($startingBlockIndex: Long!){
            transaction {
              ncTransactions(startingBlockIndex: $startingBlockIndex, actionType: "unload_from_my_garages*" limit: 1){
                id
                actions {
                  raw
                }
              }
            }
          }`;
        const { data } = await this.graphqlRequest({
            query,
            operationName: "GetGarageUnloads",
            variables: {
                startingBlockIndex: blockIndex,
            }
        });

        return data.data.transaction.ncTransactions.map(tx => {
            const action = decode(Buffer.from(tx.actions[0].raw, "hex")) as Dictionary;
            const values = (action.get("values") as Dictionary).get("l");
            const recipientAvatarAddress = Address.fromBytes(values[0]);
            const fungibleAssetValues: [Address, FungibleAssetValue][] =
                (values[1] ?? []).map(args => [
                    Address.fromBytes(args[0]),
                    {
                        currency: decodeCurrency(args[1][0]),
                        rawValue: args[1][1],
                    }
                ]);
            const fungibleItems: [Address, string, number][] =
                (values[2] ?? []).map(args => [
                    recipientAvatarAddress,
                    Buffer.from(args[0]).toString("hex"),
                    args[1]]);
            const memo = values[3];

            return (!recipientAvatarAddress.equals(avatarAddress) && fungibleAssetValues.filter(fav => agentAddress.equals(fav[0])).length == 0)
                ? null 
                : {
                    txId: tx.id,
                    fungibleAssetValues,
                    fungibleItems,
                    memo,
                };
        }).filter(ev => ev !== null);
    }

    get endpoint(): string {
        return this._apiEndpoint;
    }

    async getBlockIndex(blockHash: BlockHash): Promise<number> {
        const query = `query GetBlockHash($hash: ID!)
        { chainQuery { blockQuery { block(hash: $hash) { index } } } }`;
        const { data } = await this.graphqlRequest({
            operationName: "GetBlockHash",
            query,
            variables: {
                hash: blockHash,
            },
        });

        return data.data.chainQuery.blockQuery.block.index;
    }

    async getTipIndex(): Promise<number> {
        const query = `query
        { chainQuery { blockQuery { blocks(desc: true, limit: 1) { index } } } }`;
        const { data } = await this.graphqlRequest({
            operationName: null,
            query,
            variables: {},
        });

        return data.data.chainQuery.blockQuery.blocks[0].index;
    }

    async getBlockHash(index: number): Promise<BlockHash> {
        const query = `query GetBlockHash($index: ID!)
        { chainQuery { blockQuery { block(index: $index) { hash } } } }`;
        const { data } = await this.graphqlRequest({
            operationName: "GetBlockHash",
            query,
            variables: {
                index,
            },
        });

        return data.data.chainQuery.blockQuery.block.hash;
    }

    async getAssetTransferredEvents(blockIndex: number, recipient: Address)
        : Promise<AssetTransferredEvent[]> {
            const query = `query GetAssetTransferred($blockIndex: Long!)
            {             
                transaction {
                    ncTransactions(startingBlockIndex: $blockIndex, actionType: "^transfer_asset[0-9]*$", limit: 1) {
                        id
                        actions {
                            raw
                        }
                    }
                }
            }`;
            const { data } = await this.graphqlRequest({
                operationName: "GetAssetTransferred",
                query,
                variables: { 
                    blockIndex,
                },
            });

            return data.data.transaction.ncTransactions.map(tx => {
                const txId = tx.id;
                const action = decode(Buffer.from(tx.actions[0].raw, "hex")) as Dictionary;
                const values = (action.get("values") as BencodexDictionary);
                const sender = Address.fromBytes(values.get("sender") as Buffer);
                const recipientOnTx = Address.fromBytes(values.get("recipient") as Buffer);
                const memo = values.get("memo") as string;
                const [rawCurrency, rawValue] = values.get("amount") as [BencodexDictionary, bigint];
                const amount:FungibleAssetValue = {
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
            }).filter(ev => ev !== null);
    }
    
    async getNextTxNonce(address: string): Promise<number> {
        const query =
            "query GetNextTxNonce($address: Address!) { nextTxNonce(address: $address) } ";
        const response = await this.graphqlRequest({
            operationName: "GetNextTxNonce",
            query,
            variables: { address },
        });

        return response.data.data.nextTxNonce;
    }

    async getGenesisHash(): Promise<string> {
        const query =
            "query GetGenesisHash { chainQuery { blockQuery { block(index: 0) { hash } } } }";
        const response = await this.graphqlRequest({
            operationName: "GetGenesisHash",
            query,
            variables: {},
        });

        return response.data.data.chainQuery.blockQuery.block.hash;
    }

    async stageTransaction(payload: string): Promise<string> {
        const query = `mutation StageTransaction($payload: String!) { stageTransaction(payload: $payload) }`;
        const response = await this.graphqlRequest({
            operationName: "StageTransaction",
            query,
            variables: { payload },
        });

        return response.data.data.stageTransaction;
    }

    private async graphqlRequest(
        body: GraphQLRequestBody,
        retry: number = this._maxRetry
    ): Promise<AxiosResponse> {
        try {
            const response = await axios.post(this._apiEndpoint, body, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: 10 * 1000,
            });

            if (response.data.errors) throw response.data.errors;

            return response;
        } catch (error) {
            console.error(`Retrying left ${retry - 1}... error:`, error);
            if (retry > 0) {
                await delay(500);
                const response = await this.graphqlRequest(body, retry - 1);
                return response;
            }

            throw error;
        }
    }
}

function decodeCurrency(bdict: BencodexDictionary): Currency {
    const dpAsHex = (bdict.get("decimalPlaces") as Buffer).toString("hex");
    return {
        ticker: bdict.get("ticker").valueOf() as string,
        decimalPlaces: parseInt(`0x${dpAsHex}`),
        totalSupplyTrackable: false,
        minters: bdict.get("minters")?.valueOf() as Set<Uint8Array> ?? null,
        maximumSupply: null
    };
}

