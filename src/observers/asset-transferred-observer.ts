import { FungibleAssetValue } from "@planetarium/tx";
import { IObserver } from ".";
import { IJobExecutionStore } from "../interfaces/job-execution-store";
import { IMinter } from "../interfaces/minter";
import { AssetTransferredEvent } from "../types/asset-transferred-event";
import { BlockHash } from "../types/block-hash";
import { TransactionLocation } from "../types/transaction-location";

export class AssetTransferredObserver
    implements
        IObserver<{
            blockHash: BlockHash;
            planetID: string;
            events: (AssetTransferredEvent & TransactionLocation)[];
        }>
{
    private readonly _minter: IMinter;
    private readonly jobExecutionStore: IJobExecutionStore;

    constructor(jobExecutionStore: IJobExecutionStore, minter: IMinter) {
        this.jobExecutionStore = jobExecutionStore;
        this._minter = minter;
    }

    async notify(data: {
        blockHash: BlockHash;
        events: (AssetTransferredEvent & TransactionLocation)[];
    }): Promise<void> {
        const { events } = data;

        for (const { blockHash, txId, amount, memo: recipient } of events) {
            // TODO check memo & refund if needed.

            // Strip minters to mint well.
            const amountToMint: FungibleAssetValue = {
                currency: {
                    ...amount.currency,
                    minters: null,
                },
                rawValue: amount.rawValue,
            };

            const resTxId = await this._minter.mintAssets(
                [{ recipient, amount: amountToMint }],
                null,
            );
            await this.jobExecutionStore.putJobExec(
                txId,
                resTxId,
                this._minter.getMinterPlanet(),
                "MINT",
            );
        }
    }
}
