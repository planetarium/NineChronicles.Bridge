import { IHeadlessGraphQLClient } from "../interfaces/headless-graphql-client";
import { IMonitorStateHandler } from "../interfaces/monitor-state-handler";
import { ShutdownChecker } from "../types/shutdown-checker";
import { TransactionLocation } from "../types/transaction-location";
import { TriggerableMonitor } from "./triggerable-monitor";

const AUTHORIZED_BLOCK_INTERVAL = 1;

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

    protected async processRemains(transactionLocation: TransactionLocation) {
        const blockHash = transactionLocation.blockHash;
        const blockIndex = await this.getBlockIndex(
            transactionLocation.blockHash,
        );
        const authorizedBlockIndex =
            Math.floor(
                (blockIndex + AUTHORIZED_BLOCK_INTERVAL - 1) /
                    AUTHORIZED_BLOCK_INTERVAL,
            ) * AUTHORIZED_BLOCK_INTERVAL;
        const remainedEvents: {
            blockHash: string;
            events: (TEventData & TransactionLocation)[];
        }[] = Array(authorizedBlockIndex - blockIndex + 1);
        const events = await this.getEvents(blockIndex);
        const returnEvents = [];
        let skip = true;
        for (const event of events) {
            if (skip) {
                if (event.txId === transactionLocation.txId) {
                    skip = false;
                }
            } else {
                returnEvents.push(event);
            }
        }

        remainedEvents[0] = { blockHash, events: returnEvents };

        for (let i = 1; i <= authorizedBlockIndex - blockIndex; ++i) {
            remainedEvents[i] = {
                blockHash: await this.getBlockHash(blockIndex + i),
                events: await this.getEvents(blockIndex + i),
            };
        }

        return {
            nextBlockIndex: authorizedBlockIndex,
            remainedEvents: remainedEvents,
        };
    }

    protected triggerredBlocks(blockIndex: number): number[] {
        if (blockIndex !== 0 && blockIndex % AUTHORIZED_BLOCK_INTERVAL === 0) {
            const blockIndexes = Array(AUTHORIZED_BLOCK_INTERVAL);
            for (let i = 0; i < AUTHORIZED_BLOCK_INTERVAL; ++i) {
                blockIndexes[i] =
                    blockIndex - AUTHORIZED_BLOCK_INTERVAL + 1 + i;
            }
            return blockIndexes;
        }

        return [];
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
