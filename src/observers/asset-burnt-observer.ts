import { Address } from "@planetarium/account";
import { IObserver } from ".";
import { AssetBurntEvent } from "../types/asset-burnt-event";
import { BlockHash } from "../types/block-hash";
import { TransactionLocation } from "../types/transaction-location";
import { IAssetTransfer } from "../interfaces/asset-transfer";

export class AssetBurntObserver implements IObserver<{
    blockHash: BlockHash,
    events: (AssetBurntEvent & TransactionLocation)[];
}> {
    private readonly _transfer: IAssetTransfer;

    constructor(transfer: IAssetTransfer) {
        this._transfer = transfer;
    }

    async notify(data: { blockHash: BlockHash; events: (AssetBurntEvent & TransactionLocation)[]; }): Promise<void> {
        const { events } = data;

        for (const ev of events) {
            try {
                const targetAddress = Address.fromHex(ev.memo);
                await this._transfer.transfer(targetAddress, ev.amount, null);
            } catch(e) {
                console.error(e);
            }
        }
    }
}
