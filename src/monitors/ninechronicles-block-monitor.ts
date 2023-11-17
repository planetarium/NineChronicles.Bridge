import { IHeadlessGraphQLClient } from "../interfaces/headless-graphql-client";
import { IMonitorStateHandler } from "../interfaces/monitor-state-handler";
import { ShutdownChecker } from "../types/shutdown-checker";
import { TransactionLocation } from "../types/transaction-location";
import { TriggerableMonitor } from "./triggerable-monitor";

export abstract class NineChroniclesMonitor<
    TEventData,
> extends TriggerableMonitor<TEventData & TransactionLocation> {
    protected readonly _headlessGraphQLClient: IHeadlessGraphQLClient;

    constructor(
        monitorStateHandler: IMonitorStateHandler,
        shutdownChecker: ShutdownChecker,
        headlessGraphQLClient: IHeadlessGraphQLClient,
    ) {
        super(monitorStateHandler, shutdownChecker);

        this._headlessGraphQLClient = headlessGraphQLClient;
    }

    protected getBlockIndex(blockHash: string) {
        return this._headlessGraphQLClient.getBlockIndex(blockHash);
    }

    protected getTipIndex(): Promise<number> {
        return this._headlessGraphQLClient.getTipIndex();
    }

    protected getBlockHash(blockIndex: number) {
        return this._headlessGraphQLClient.getBlockHash(blockIndex);
    }
}
