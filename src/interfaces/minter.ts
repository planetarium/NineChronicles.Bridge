import { Address } from "@planetarium/account";
import { FungibleAssetValue } from "@planetarium/tx";
import { FungibleItemId } from "../types/fungible-item-id";
import { TxId } from "../types/txid";

export interface IFungibleAssetValues {
    recipient: string;
    amount: FungibleAssetValue;
}

export interface IFungibleItems {
    recipient: string;
    fungibleItemId: FungibleItemId;
    count: number;
}

export interface IMinter {
    getMinterAddress(): Promise<Address>;
    getMinterPlanet(): string;

    mintAssets(
        assets: [IFungibleAssetValues | IFungibleItems],
        memo: string | null,
    ): Promise<TxId>;
}
