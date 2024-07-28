import { Address } from "@planetarium/account";
import { FungibleAssetValue } from "@planetarium/tx";
import { FungibleItemId } from "./fungible-item-id";
import { TxId } from "./txid";

export interface GarageUnloadEvent {
    txId: TxId;
    signer: string;
    fungibleAssetValues: [Address, FungibleAssetValue][];
    fungibleItems: [Address, FungibleItemId, bigint][];
    memo: string | null;
}
