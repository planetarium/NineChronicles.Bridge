import { Job } from "@prisma/client";
import { captureException } from "@sentry/node";
import { Monitor } from ".";
import { IHeadlessGraphQLClient } from "../interfaces/headless-graphql-client";
import { IJobExecutionStore } from "../interfaces/job-execution-store";
import { IMonitorStateHandler } from "../interfaces/monitor-state-handler";
import { BlockHash } from "../types/block-hash";
import { TransactionLocation } from "../types/transaction-location";

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

export abstract class NineChroniclesMonitor<TEventData> extends Monitor<
    TEventData & TransactionLocation
> {
    private readonly _monitorStateHandler: IMonitorStateHandler;
    private readonly _delayMilliseconds: number;
    protected readonly _jobExecutionStore: IJobExecutionStore;
    protected readonly _headlessGraphQLClient: IHeadlessGraphQLClient;

    private latestBlockNumber: number | undefined;

    constructor(
        monitorStateHandler: IMonitorStateHandler,
        jobExecutionStore: IJobExecutionStore,
        headlessGraphQLClient: IHeadlessGraphQLClient,
        delayMilliseconds: number = 15 * 1000,
    ) {
        super();

        this._monitorStateHandler = monitorStateHandler;
        this._headlessGraphQLClient = headlessGraphQLClient;
        this._jobExecutionStore = jobExecutionStore;
        this._delayMilliseconds = delayMilliseconds;
    }

    async *loop(): AsyncIterableIterator<{
        blockHash: BlockHash;
        events: (TEventData & TransactionLocation)[];
    }> {
        const nullableLatestBlockHash = await this._monitorStateHandler.load();
        if (nullableLatestBlockHash !== null) {
            this.latestBlockNumber = await this.getBlockIndex(
                nullableLatestBlockHash,
            );
        } else {
            this.latestBlockNumber = await this.getTipIndex();
        }

        while (this.isRunnning()) {
            console.log(
                `${this.constructor.name}.isRunning()`,
                this.isRunnning(),
            );
            try {
                const tipIndex = await this.getTipIndex();
                this.debug("Try to execute at", this.latestBlockNumber + 1);
                if (this.latestBlockNumber + 1 <= tipIndex) {
                    const blockIndex = this.latestBlockNumber;

                    this.debug("Execute block #", blockIndex);
                    const blockHash = await this.getBlockHash(blockIndex);

                    yield {
                        blockHash,
                        events: await this.getEvents(blockIndex),
                    };

                    await this._monitorStateHandler.store(blockHash);

                    this.latestBlockNumber += 1;
                } else {
                    this.debug(
                        `Skip. lastestBlockNumber: ${this.latestBlockNumber} / tip: ${tipIndex}`,
                    );

                    await delay(this._delayMilliseconds);
                }
            } catch (error) {
                this.error(
                    "Ignore and continue loop without breaking though unexpected error occurred:",
                    error,
                );
                captureException(error);
            }
        }
    }

    protected debug(message?: unknown, ...optionalParams: unknown[]): void {
        console.debug(`[${this.constructor.name}]`, message, ...optionalParams);
    }

    protected error(message?: unknown, ...optionalParams: unknown[]): void {
        console.error(`[${this.constructor.name}]`, message, ...optionalParams);
    }

    protected abstract getEvents(
        blockIndex: number,
    ): Promise<(TEventData & TransactionLocation)[]>;

    private getBlockIndex(blockHash: string) {
        return this._headlessGraphQLClient.getBlockIndex(blockHash);
    }

    private getTipIndex(): Promise<number> {
        return this._headlessGraphQLClient.getTipIndex();
    }

    private getBlockHash(blockIndex: number) {
        return this._headlessGraphQLClient.getBlockHash(blockIndex);
    }
}
