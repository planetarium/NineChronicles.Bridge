import { Address } from "@planetarium/account";
import { RecordView } from "@planetarium/bencodex";
import { FungibleAssetValue, encodeCurrency } from "@planetarium/tx";
import { IAssetBurner } from "./interfaces/asset-burner";
import { Signer } from "./signer";

export class AssetBurner implements IAssetBurner {
    private readonly signer: Signer;

    constructor(signer: Signer) {
        this.signer = signer;
    }

    getBurnerPlanet(): string {
        return this.signer.getSignPlanet();
    }

    async burn(amount: FungibleAssetValue, memo: string): Promise<string> {
        const sender = await this.signer.getAddress();
        const action = encodeBurnAssetAction(sender, amount, memo);

        return await this.signer.sendTx(action);
    }
}

export function encodeBurnAssetAction(
    sender: Address,
    amount: FungibleAssetValue,
    memo: string,
): RecordView {
    return new RecordView(
        {
            type_id: "burn_asset",
            values: [
                sender.toBytes(),
                [encodeCurrency(amount.currency), amount.rawValue],
                memo,
            ],
        },
        "text",
    );
}
