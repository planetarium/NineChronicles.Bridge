import { Address } from "@planetarium/account";
import { IHeadlessGraphQLClient } from "../interfaces/headless-graphql-client";
import { GarageUnloadEvent } from "../types/garage-unload-event";
import { ShutdownChecker } from "../types/shutdown-checker";
import { TransactionLocation } from "../types/transaction-location";
import { NineChroniclesMonitor } from "./ninechronicles-block-monitor";

export class GarageUnloadMonitor extends NineChroniclesMonitor<GarageUnloadEvent> {
    private readonly _agentAddress: Address;
    private readonly _avatarAddress: Address;

    constructor(
        latestTransactionLocation: TransactionLocation | null,
        shutdownChecker: ShutdownChecker,
        headlessGraphQLClient: IHeadlessGraphQLClient,
        agentAddress: Address,
        avatarAddress: Address,
    ) {
        super(
            latestTransactionLocation,
            shutdownChecker,
            headlessGraphQLClient,
        );
        this._agentAddress = agentAddress;
        this._avatarAddress = avatarAddress;
    }

    protected async getEvents(
        blockIndex: number,
    ): Promise<(GarageUnloadEvent & TransactionLocation)[]> {
        const blockHash =
            await this._headlessGraphQLClient.getBlockHash(blockIndex);
        const events = await this._headlessGraphQLClient.getGarageUnloadEvents(
            blockIndex - 1, // need to wait 1 block far from tip due to 9c headless' bug.
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
            return { blockHash, ...ev };
        });
    }
}
