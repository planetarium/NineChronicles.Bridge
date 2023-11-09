import { FungibleAssetValue } from "@planetarium/tx";
import { FungibleItemId } from "./fungible-item-id";
import { TxId } from "./txid";
import { Address } from "@planetarium/account";

export interface GarageUnloadEvent {
    txId: TxId;
    fungibleAssetValues: [[Address, FungibleAssetValue]];
    fungibleItems: [[Address, FungibleItemId, number]];
    memo: string | null;
}
