import { Address } from "@planetarium/account";
import { RecordView } from "@planetarium/bencodex";
import { FungibleAssetValue, encodeCurrency } from "@planetarium/tx";

export function encodeTransferAssetAction(
    recipient: Address,
    sender: Address,
    amount: FungibleAssetValue,
    memo: string,
) {
    return new RecordView(
        {
            type_id: "transfer_asset5",
            values: {
                // `encodeFungibleAssetValue()` wasn't exported properly.
                amount: [encodeCurrency(amount.currency), amount.rawValue],
                ...(memo === null ? {} : { memo }),
                recipient: Buffer.from(recipient.toBytes()),
                sender: Buffer.from(sender.toBytes()),
            },
        },
        "text",
    );
}
