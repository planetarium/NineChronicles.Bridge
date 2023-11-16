import { Address } from "@planetarium/account";
import { FungibleAssetValue } from "@planetarium/tx";
import { TxId } from "./txid";

export interface AssetTransferredEvent {
    txId: TxId;
    sender: Address;
    recipient: Address;
    amount: FungibleAssetValue;
    memo: string | null;
}
