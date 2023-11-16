import { RecordView } from "@planetarium/bencodex";
import { FungibleAssetValue, encodeCurrency } from "@planetarium/tx";
import { IAssetBurner } from "./interfaces/asset-burner";
import { Signer } from "./signer";

export class AssetBurner implements IAssetBurner {
    private readonly signer: Signer;

    constructor(signer: Signer) {
        this.signer = signer;
    }

    async burn(amount: FungibleAssetValue, memo: string): Promise<string> {
        const sender = (await this.signer.getAddress()).toBytes();
        const action = new RecordView(
            {
                type_id: "burn_asset",
                values: [
                    sender,
                    [encodeCurrency(amount.currency), amount.rawValue],
                    memo,
                ],
            },
            "text",
        );

        return await this.signer.sendTx(action);
    }
}
