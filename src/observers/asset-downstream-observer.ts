import { Address } from "@planetarium/account";
import { IObserver } from ".";
import { BlockHash } from "../types/block-hash";
import { TransactionLocation } from "../types/transaction-location";
import { IAssetTransfer } from "../interfaces/asset-transfer";
import { AssetTransferredEvent } from "../types/asset-transferred-event";
import { IAssetBurner } from "../interfaces/asset-burner";

export class AssetDownstreamObserver implements IObserver<{
    blockHash: BlockHash,
    events: (AssetTransferredEvent & TransactionLocation)[];
}> {
    private readonly _transfer: IAssetTransfer;
    private readonly _burner: IAssetBurner;

    constructor(upstreamTransfer: IAssetTransfer, downstreamBurner: IAssetBurner) {
        this._transfer = upstreamTransfer;
        this._burner = downstreamBurner;
    }

    async notify(data: { blockHash: BlockHash; events: (AssetTransferredEvent & TransactionLocation)[]; }): Promise<void> {
        const { events } = data;

        for (const ev of events) {
            if (ev.amount.currency.ticker !== "NCG") {
                continue;
            }

            try {
                await this._burner.burn(ev.amount, ev.txId);

                const targetAddress = Address.fromHex(ev.memo);
                await this._transfer.transfer(targetAddress, ev.amount, null);
            } catch(e) {
                console.error(e);
            }
        }
    }
}
