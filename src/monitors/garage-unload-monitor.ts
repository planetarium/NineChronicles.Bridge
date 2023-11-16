import { Address } from "@planetarium/account";
import { IHeadlessGraphQLClient } from "../interfaces/headless-graphql-client";
import { GarageUnloadEvent } from "../types/garage-unload-event";
import { TransactionLocation } from "../types/transaction-location";
import { NineChroniclesMonitor } from "./ninechronicles-block-monitor";

export class GarageUnloadMonitor extends NineChroniclesMonitor<GarageUnloadEvent> {
    private readonly _agentAddress: Address;
    private readonly _avatarAddress: Address;

    constructor(
        latestTransactionLocation: TransactionLocation | null,
        headlessGraphQLClient: IHeadlessGraphQLClient,
        agentAddress: Address,
        avatarAddress: Address,
    ) {
        super(latestTransactionLocation, headlessGraphQLClient);
        this._agentAddress = agentAddress;
        this._avatarAddress = avatarAddress;
    }

    protected async getEvents(
        blockIndex: number,
    ): Promise<(GarageUnloadEvent & TransactionLocation)[]> {
        const blockHash =
            await this._headlessGraphQLClient.getBlockHash(blockIndex);
        const events = await this._headlessGraphQLClient.getGarageUnloadEvents(
            blockIndex,
            this._agentAddress,
            this._avatarAddress,
        );

        return events.map((ev) => {
            return { blockHash, ...ev };
        });
    }
}
