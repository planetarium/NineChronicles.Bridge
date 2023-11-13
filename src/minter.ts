import { Address } from "@planetarium/account";
import { encodeCurrency } from "@planetarium/tx";
import { IFungibleAssetValues, IFungibleItems, IMinter } from "./interfaces/minter";
import { RecordView, Value } from "@planetarium/bencodex";
import { Signer } from "./signer";


export class Minter implements IMinter {
    private readonly signer: Signer;
    
    constructor(signer: Signer) {
        this.signer = signer;
    }
    
    async mintAssets(assets: [IFungibleAssetValues | IFungibleItems]): Promise<string> {
        const action = new RecordView(            
            {
                type_id: "mint_assets",
                values: assets.map(encodeMintSpec),
            },
            "text"
        );

        return await this.signer.sendTx(action);
    }
    
    getMinterAddress(): Promise<Address> {
        return this.signer.getAddress();
    }
}

function encodeMintSpec(value: IFungibleAssetValues | IFungibleItems): Value {
    if ((value as IFungibleAssetValues).amount !== undefined) {
        const favs = value as IFungibleAssetValues;
        return [
            Address.fromHex(favs.recipient, true).toBytes(),
            [
                encodeCurrency(favs.amount.currency),
                favs.amount.rawValue,
            ],
            null
        ];
    } else {
        const fis = value as IFungibleItems;
        return [
            Address.fromHex(fis.recipient, true).toBytes(),
            null,
            [Buffer.from(fis.fungibleItemId, "hex"), BigInt(fis.count)],
        ]
    }
}
