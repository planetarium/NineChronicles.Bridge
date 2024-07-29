import { Address } from "@planetarium/account";
import { RecordView, Value } from "@planetarium/bencodex";
import { FungibleAssetValue, encodeCurrency } from "@planetarium/tx";
import { FungibleItemId } from "../types/fungible-item-id";

export interface IFungibleAssetValues {
    recipient: Address;
    amount: FungibleAssetValue;
}

export interface IFungibleItems {
    recipient: Address;
    fungibleItemId: FungibleItemId;
    count: bigint;
}

function encodeMintSpec(value: IFungibleAssetValues | IFungibleItems): Value {
    if ((value as IFungibleAssetValues).amount !== undefined) {
        const favs = value as IFungibleAssetValues;
        return [
            favs.recipient.toBytes(),
            [encodeCurrency(favs.amount.currency), favs.amount.rawValue],
            null,
        ];
    } else {
        const fis = value as IFungibleItems;
        return [
            fis.recipient.toBytes(),
            null,
            [Buffer.from(fis.fungibleItemId, "hex"), fis.count],
        ];
    }
}

export function encodeMintAssetsAction(
    assets: (IFungibleAssetValues | IFungibleItems)[],
    memo: string | null,
): RecordView {
    return new RecordView(
        {
            type_id: "mint_assets",
            values: [memo, ...assets.map(encodeMintSpec)],
        },
        "text",
    );
}
