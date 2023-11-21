import { Address } from "@planetarium/account";
import { IHeadlessGraphQLClient } from "../interfaces/headless-graphql-client";
import { IJobExecutionStore } from "../interfaces/job-execution-store";
import { IMonitorStateHandler } from "../interfaces/monitor-state-handler";
import { GarageUnloadEvent } from "../types/garage-unload-event";
import { TransactionLocation } from "../types/transaction-location";
import { NineChroniclesMonitor } from "./ninechronicles-block-monitor";

export class GarageUnloadMonitor extends NineChroniclesMonitor<GarageUnloadEvent> {
    private readonly _agentAddress: Address;
    private readonly _avatarAddress: Address;

    constructor(
        monitorStateHandler: IMonitorStateHandler,
        jobExecutionStore: IJobExecutionStore,
        headlessGraphQLClient: IHeadlessGraphQLClient,
        agentAddress: Address,
        avatarAddress: Address,
    ) {
        super(monitorStateHandler, jobExecutionStore, headlessGraphQLClient);
        this._agentAddress = agentAddress;
        this._avatarAddress = avatarAddress;
    }

    protected async getEvents(
        blockIndex: number,
    ): Promise<(GarageUnloadEvent & TransactionLocation)[]> {
        const planetID = this._headlessGraphQLClient.getPlanetID();
        const blockHash =
            await this._headlessGraphQLClient.getBlockHash(blockIndex);
        const events = await this._headlessGraphQLClient.getGarageUnloadEvents(
            blockIndex,
            this._agentAddress,
            this._avatarAddress,
        );

        const successEvents: GarageUnloadEvent[] = [];
        for (const event of events) {
            const { txStatus } =
                await this._headlessGraphQLClient.getTransactionResult(
                    event.txId,
                );
            if (txStatus === "SUCCESS") {
                successEvents.push(event);
            }
        }

        return successEvents.map((ev) => {
            return { blockHash, planetID, ...ev };
        });
    }
}
