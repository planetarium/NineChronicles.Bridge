import { Address } from "@planetarium/account";
import { FungibleAssetValue } from "@planetarium/tx";
import { TxId } from "./txid";

export interface AssetBurntEvent {
    txId: TxId,
    amount: FungibleAssetValue,
    memo: string,
}