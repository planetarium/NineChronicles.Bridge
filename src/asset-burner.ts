import { Address } from "@planetarium/account";
import { RecordView } from "@planetarium/bencodex";
import { FungibleAssetValue, encodeCurrency } from "@planetarium/tx";

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
