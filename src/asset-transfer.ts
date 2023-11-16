import { Address } from "@planetarium/account";
import { RecordView } from "@planetarium/bencodex";
import {
    FungibleAssetValue,
    encodeCurrency,
    encodeSignedTx,
    signTx,
} from "@planetarium/tx";
import { IAssetTransfer } from "./interfaces/asset-transfer";
import { Signer } from "./signer";

export class AssetTransfer implements IAssetTransfer {
    private readonly signer: Signer;

    constructor(signer: Signer) {
        this.signer = signer;
    }

    async transfer(
        recipient: Address,
        amount: FungibleAssetValue,
        memo: string,
    ): Promise<string> {
        const sender = (await this.signer.getAddress()).toBytes();
        const action = new RecordView(
            {
                type_id: "transfer_asset5",
                values: {
                    // `encodeFungibleAssetValue()` wasn't exported properly.
                    amount: [encodeCurrency(amount.currency), amount.rawValue],
                    ...(memo === null ? {} : { memo }),
                    recipient: Buffer.from(recipient.toBytes()),
                    sender: Buffer.from(sender),
                },
            },
            "text",
        );

        return await this.signer.sendTx(action);
    }
}
