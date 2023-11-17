import { BlockHash } from "../types/block-hash";

export interface IMonitorStateHandler {
    load(): Promise<BlockHash | null>;
    store(blockHash: BlockHash): Promise<void>;
}
