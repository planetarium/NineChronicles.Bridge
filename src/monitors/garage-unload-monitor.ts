import { Address } from "@planetarium/account";
import { IHeadlessGraphQLClient } from "../interfaces/headless-graphql-client";
import { IMonitorStateHandler } from "../interfaces/monitor-state-handler";
import { GarageUnloadEvent } from "../types/garage-unload-event";
import { TransactionLocation } from "../types/transaction-location";
import { NineChroniclesMonitor } from "./ninechronicles-block-monitor";

export class GarageUnloadMonitor extends NineChroniclesMonitor<GarageUnloadEvent> {
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
    ): Promise<(GarageUnloadEvent & TransactionLocation)[]> {
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

    const successEvents: GarageUnloadEvent[] = [];
    for (const event of events) {
        const { txStatus } = await headlessGraphQLClient.getTransactionResult(
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
