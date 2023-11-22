export type TransactionStatus = "INVALID" | "STAGING" | "FAILURE" | "SUCCESS";

export interface TransactionResult {
    txStatus: TransactionStatus;
    blockIndex: number;
}
