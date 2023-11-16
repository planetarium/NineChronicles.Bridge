import { Address } from "@planetarium/account";
import { IHeadlessGraphQLClient } from "../interfaces/headless-graphql-client";
import { AssetTransferredEvent } from "../types/asset-transferred-event";
import { ShutdownChecker } from "../types/shutdown-checker";
import { TransactionLocation } from "../types/transaction-location";
import { NineChroniclesMonitor } from "./ninechronicles-block-monitor";

export class AssetsTransferredMonitor extends NineChroniclesMonitor<AssetTransferredEvent> {
    private readonly _address: Address;

    constructor(
        latestTransactionLocation: TransactionLocation | null,
        shutdownChecker: ShutdownChecker,
        headlessGraphQLClient: IHeadlessGraphQLClient,
        address: Address,
    ) {
        super(
            latestTransactionLocation,
            shutdownChecker,
            headlessGraphQLClient,
        );
        this._address = address;
    }

    protected async getEvents(
        blockIndex: number,
    ): Promise<(AssetTransferredEvent & TransactionLocation)[]> {
        const blockHash =
            await this._headlessGraphQLClient.getBlockHash(blockIndex);
        const events =
            await this._headlessGraphQLClient.getAssetTransferredEvents(
                blockIndex - 1,  // need to wait 1 block far from tip due to 9c headless' bug.
                this._address,
            );

        const successEvents: AssetTransferredEvent[] = [];
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
