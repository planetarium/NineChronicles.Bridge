import { Address } from "@planetarium/account";
import { IHeadlessGraphQLClient } from "../interfaces/headless-graphql-client";
import { IMonitorStateHandler } from "../interfaces/monitor-state-handler";
import { GarageUnloadEvent } from "../types/garage-unload-event";
import { TransactionLocation } from "../types/transaction-location";
import { NineChroniclesMonitor } from "./ninechronicles-block-monitor";

export type ValidatedGarageUnloadEvent = Omit<GarageUnloadEvent, "memo"> & {
    parsedMemo: {
        agentAddress: string;
        avatarAddress: string;
        memo: string;
    };
};

export class GarageUnloadMonitor extends NineChroniclesMonitor<ValidatedGarageUnloadEvent> {
    private readonly _agentAddress: Address;
    private readonly _avatarAddress: Address;

    constructor(
        monitorStateHandler: IMonitorStateHandler,
        headlessGraphQLClient: IHeadlessGraphQLClient,
        agentAddress: Address,
        avatarAddress: Address,
    ) {
        super(monitorStateHandler, headlessGraphQLClient);
        this._agentAddress = agentAddress;
        this._avatarAddress = avatarAddress;
    }

    protected async getEvents(
        blockIndex: number,
    ): Promise<(ValidatedGarageUnloadEvent & TransactionLocation)[]> {
        return getGarageUnloadEvents(
            this._headlessGraphQLClient,
            this._agentAddress,
            this._avatarAddress,
            blockIndex,
        );
    }
}

export async function getGarageUnloadEvents(
    headlessGraphQLClient: IHeadlessGraphQLClient,
    agentAddress: Address,
    avatarAddress: Address,
    blockIndex: number,
) {
    const planetID = headlessGraphQLClient.getPlanetID();
    const blockHash = await headlessGraphQLClient.getBlockHash(blockIndex);
    const events = await headlessGraphQLClient.getGarageUnloadEvents(
        blockIndex,
        agentAddress,
        avatarAddress,
    );

    const successEvents: ValidatedGarageUnloadEvent[] = [];
    for (const event of events) {
        const { txStatus } = await headlessGraphQLClient.getTransactionResult(
            event.txId,
        );
        if (txStatus !== "SUCCESS") {
            continue;
        }

        let parsedMemo = null;
        try {
            parsedMemo = parseMemo(event.memo);
        } catch (e) {
            console.error(
                `Skip ${event.txId} because failed to parse`,
                event.memo,
                e,
            );
            continue;
        }

        successEvents.push({
            ...event,
            parsedMemo,
        });
    }

    return successEvents.map((ev) => {
        return { blockHash, planetID, ...ev };
    });
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
