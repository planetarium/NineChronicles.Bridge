import { Address } from "@planetarium/account";
import { RecordView, Value } from "@planetarium/bencodex";
import { encodeCurrency } from "@planetarium/tx";
import {
    IFungibleAssetValues,
    IFungibleItems,
    IMinter,
} from "./interfaces/minter";
import { Signer } from "./signer";

export class Minter implements IMinter {
    private readonly signer: Signer;

    constructor(signer: Signer) {
        this.signer = signer;
    }

    async mintAssets(
        assets: [IFungibleAssetValues | IFungibleItems],
        memo: string | null,
    ): Promise<string> {
        const action = new RecordView(
            {
                type_id: "mint_assets",
                values: [memo, ...assets.map(encodeMintSpec)],
            },
            "text",
        );

        return await this.signer.sendTx(action);
    }

    getMinterAddress(): Promise<Address> {
        return this.signer.getAddress();
    }

    getMinterPlanet(): string {
        return this.signer.getSignPlanet();
    }
}

function encodeMintSpec(value: IFungibleAssetValues | IFungibleItems): Value {
    if ((value as IFungibleAssetValues).amount !== undefined) {
        const favs = value as IFungibleAssetValues;
        return [
            Address.fromHex(favs.recipient, true).toBytes(),
            [encodeCurrency(favs.amount.currency), favs.amount.rawValue],
            null,
        ];
    } else {
        const fis = value as IFungibleItems;
        return [
            Address.fromHex(fis.recipient, true).toBytes(),
            null,
            [Buffer.from(fis.fungibleItemId, "hex"), BigInt(fis.count)],
        ];
    }
}
