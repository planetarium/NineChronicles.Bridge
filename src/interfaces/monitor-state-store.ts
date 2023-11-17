import { BlockHash } from "../types/block-hash";

export interface IMonitorStateStore {
    store(network: string, blockHash: BlockHash): Promise<void>;
    load(network: string): Promise<BlockHash | null>;
}
