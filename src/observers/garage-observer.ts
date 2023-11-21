import { IObserver } from ".";
import { IJobExecutionStore } from "../interfaces/job-execution-store";
import {
    IFungibleAssetValues,
    IFungibleItems,
    IMinter,
} from "../interfaces/minter";
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
    private readonly jobExecutionStore: IJobExecutionStore;

    constructor(jobExecutionStore: IJobExecutionStore, minter: IMinter) {
        this._minter = minter;
        this.jobExecutionStore = jobExecutionStore;
    }

    async notify(data: {
        blockHash: BlockHash;
        events: (GarageUnloadEvent & TransactionLocation)[];
    }): Promise<void> {
        const { events } = data;

        for (const {
            blockHash,
            txId,
            planetID,
            fungibleAssetValues,
            fungibleItems,
            memo,
        } of events) {
            const {
                agentAddress,
                avatarAddress,
                memo: memoForMinter,
            } = parseMemo(memo);

            const requests: (IFungibleAssetValues | IFungibleItems)[] = [];
            for (const fa of fungibleAssetValues) {
                requests.push({
                    recipient: agentAddress,
                    amount: fa[1],
                });
            }

            for (const fi of fungibleItems) {
                requests.push({
                    recipient: avatarAddress,
                    fungibleItemId: fi[1],
                    count: fi[2],
                });
            }

            if (requests.length !== 0) {
                // @ts-ignore
                const resTxId = await this._minter.mintAssets(
                    requests,
                    memoForMinter,
                );
                this.jobExecutionStore.putJobExec(
                    txId,
                    resTxId,
                    this._minter.getMinterPlanet(),
                    "MINT",
                );
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
