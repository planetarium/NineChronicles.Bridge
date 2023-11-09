import { AssetBurntEvent } from "../types/asset-burnt-event";
import { TransactionLocation } from "../types/transaction-location";
import { NineChroniclesMonitor } from "./ninechronicles-block-monitor";


export class AssetsBurnMonitor extends NineChroniclesMonitor<AssetBurntEvent> {
    protected async getEvents(blockIndex: number): Promise<(AssetBurntEvent & TransactionLocation)[]> {
        const blockHash = await this._headlessGraphQLClient.getBlockHash(blockIndex);
        return (await this._headlessGraphQLClient.getAssetBurntEvents(blockIndex)).map(ev => {
            return {
                blockHash,
                ...ev,
            };
        });
    }
}