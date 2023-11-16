import { Address } from "@planetarium/account";
import { FungibleAssetValue } from "@planetarium/tx";

export interface IAssetTransfer {
    transfer(
        recipient: Address,
        amount: FungibleAssetValue,
        memo: string,
    ): Promise<string>;
}
