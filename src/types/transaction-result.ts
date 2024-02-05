export type TransactionStatus =
    | "INVALID"
    | "STAGING"
    | "FAILURE"
    | "SUCCESS"
    | "INCLUDED";

export interface TransactionResult {
    txStatus: TransactionStatus;
}
