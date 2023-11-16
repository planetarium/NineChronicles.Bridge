import { FungibleAssetValue } from "@planetarium/tx";
import { TxId } from "../types/txid";
import { FungibleItemId } from "../types/fungible-item-id";
import { Address } from "@planetarium/account";

export interface IFungibleAssetValues
{
    recipient: string,
    amount: FungibleAssetValue,
}

export interface IFungibleItems
{
    recipient: string,
    fungibleItemId: FungibleItemId,
    count: number,
}

export interface IMinter {
    getMinterAddress(): Promise<Address>;

    mintAssets(assets: [IFungibleAssetValues | IFungibleItems], memo: string | null): Promise<TxId>;
}
