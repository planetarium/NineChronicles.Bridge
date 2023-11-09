import { Address } from "@planetarium/account";
import { BlockHash } from "../types/block-hash";
import { GarageUnloadEvent } from "../types/garage-unload-event";
import { AssetTransferredEvent } from "../types/asset-transferred-event";

export interface IHeadlessGraphQLClient {
    readonly endpoint: string;

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
}
