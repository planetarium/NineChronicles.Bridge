import { Address } from "@planetarium/account";
import { TxId } from "./txid";
import { FungibleAssetValue } from "@planetarium/tx";

export interface AssetTransferredEvent {
    txId: TxId;
    sender: Address;
    recipient: Address;
    amount: FungibleAssetValue;
    memo: string | null;
}