import { IObserver } from ".";
import { IMonitorStateStore } from "../interfaces/monitor-state-store";
import { IMinter } from "../interfaces/minter";
import { BlockHash } from "../types/block-hash";
import { TransactionLocation } from "../types/transaction-location";
import { AssetTransferredEvent } from "../types/asset-transferred-event";
import { FungibleAssetValue } from "@planetarium/tx";

export class AssetTransferredObserver implements IObserver<{
    blockHash: BlockHash,
    events: (AssetTransferredEvent & TransactionLocation)[];
}>
{
    private readonly _monitorStateStore: IMonitorStateStore;
    private readonly _minter: IMinter;
    
    constructor(monitorStateStore: IMonitorStateStore, minter: IMinter) {
        this._monitorStateStore = monitorStateStore;
        this._minter = minter;
    }

    async notify(data: { blockHash: BlockHash; events: (AssetTransferredEvent & TransactionLocation)[]; }): Promise<void> {
        const { events } = data;

        for ( const {blockHash, txId, amount, memo: recipient} of events)
        {
            await this._monitorStateStore.store("nine-chronicles", {
                blockHash,
                txId,
            });

            // TODO check memo & refund if needed.
            
            // Strip minters to mint well.
            const amountToMint:FungibleAssetValue = {
                currency: {
                    ...amount.currency,
                    minters: null,
                },
                rawValue: amount.rawValue,
            };

            await this._minter.mintAssets([{ recipient, amount: amountToMint }], null);
        }
    }
}