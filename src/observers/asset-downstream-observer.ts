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
            this.debug(
                "Start handle",
                ev.txId,
                "at",
                ev.blockHash,
                "with",
                `${ev.amount.currency.ticker} `
                    + `(decimalPlaces: ${ev.amount.currency.decimalPlaces.toString()}, `
                    + `rawValue: ${ev.amount.rawValue.toString()})`,
                "amount");

            if (ev.amount.currency.ticker !== "NCG") {
                this.debug("Skip because the ticker is not NCG.");
                continue;
            }

            try {
                this.debug(`Try to burn`);
                const burnTxId = await this._burner.burn(ev.amount, ev.txId);
                this.debug(`BurnAsset TxId is`, burnTxId);
                
                const targetAddress = Address.fromHex(ev.memo);
                // FIXME: Always assume the upstream network is odin, and force modify to odin minters for NCG.
                const amount = ev.amount.currency.ticker === "NCG" ? {
                    currency: {
                        ...ev.amount.currency,
                        minters: new Set([Buffer.from("47d082a115c63e7b58b1532d20e631538eafadde", "hex")])
                    },
                    rawValue: ev.amount.rawValue,
                } : ev.amount;

                this.debug(`Try to transfer`);
                const transferTxId = await this._transfer.transfer(targetAddress, amount, null);
                this.debug(`TransferAsset TxId is`, transferTxId);
            } catch(e) {
                console.error(e);
            }
        }
    }

    private debug(message?: any, ...optionalParams: any[]): void {
        console.debug(`[${this.constructor.name}]`, message, ...optionalParams);
    }
}
