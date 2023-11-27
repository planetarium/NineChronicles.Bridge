import { BlockHash } from "./block-hash";
import { TxId } from "./txid";

export interface TransactionLocation {
    planetID: string;
    blockHash: BlockHash;
    txId: TxId | null;
}
