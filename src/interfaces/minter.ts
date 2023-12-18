import { FungibleAssetValue } from "@planetarium/tx";
import { FungibleItemId } from "../types/fungible-item-id";

export interface IFungibleAssetValues {
    recipient: string;
    amount: FungibleAssetValue;
}

export interface IFungibleItems {
    recipient: string;
    fungibleItemId: FungibleItemId;
    count: number;
}
