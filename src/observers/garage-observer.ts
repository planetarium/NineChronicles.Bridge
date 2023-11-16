import { IObserver } from ".";
import {
    IFungibleAssetValues,
    IFungibleItems,
    IMinter,
} from "../interfaces/minter";
import { IMonitorStateStore } from "../interfaces/monitor-state-store";
import { BlockHash } from "../types/block-hash";
import { GarageUnloadEvent } from "../types/garage-unload-event";
import { TransactionLocation } from "../types/transaction-location";

export class GarageObserver
    implements
        IObserver<{
            blockHash: BlockHash;
            events: (GarageUnloadEvent & TransactionLocation)[];
        }>
{
    private readonly _minter: IMinter;
    private readonly _monitorStateStore: IMonitorStateStore;

    constructor(monitorStateStore: IMonitorStateStore, minter: IMinter) {
        this._minter = minter;
        this._monitorStateStore = monitorStateStore;
    }

    async notify(data: {
        blockHash: BlockHash;
        events: (GarageUnloadEvent & TransactionLocation)[];
    }): Promise<void> {
        const { events } = data;

        for (const {
            blockHash,
            txId,
            fungibleAssetValues,
            fungibleItems,
            memo,
        } of events) {
            await this._monitorStateStore.store("nine-chronicles", {
                blockHash,
                txId,
            });

            const {
                agentAddress,
                avatarAddress,
                memo: memoForMinter,
            } = parseMemo(memo);
            console.log(`Memo parsed (agentAddress: ${agentAddress}, avatarAddress: ${avatarAddress}, memo: ${memoForMinter}`);

            const requests: (IFungibleAssetValues | IFungibleItems)[] = [];
            for (const fa of fungibleAssetValues) {
                console.log(`fungible item detected. (address: ${fa[0]}`);
                requests.push({
                    recipient: agentAddress,
                    amount: fa[1],
                });
            }

            for (const fi of fungibleItems) {
                console.log(`fungible item detected. (address: ${fi[0]}, id: ${fi[1]}, count: ${fi[2]}`);
                requests.push({
                    recipient: avatarAddress,
                    fungibleItemId: fi[1],
                    count: fi[2],
                });
            }

            if (requests.length !== 0) {
                console.log(`Minting for ${requests.length} requests... (memo: ${memoForMinter})`);
                // @ts-ignore
                await this._minter.mintAssets(requests, memoForMinter);
            }
        }
    }
}
function parseMemo(memo: string): {
    agentAddress: string;
    avatarAddress: string;
    memo: string;
} {
    const parsed = JSON.parse(memo);

    return {
        agentAddress: parsed[0],
        avatarAddress: parsed[1],
        memo: parsed[2],
    };
}
