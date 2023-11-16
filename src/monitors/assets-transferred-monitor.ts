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
        return (
            await this._headlessGraphQLClient.getAssetTransferredEvents(
                blockIndex,
                this._address,
            )
        ).map((ev) => {
            return { blockHash, ...ev };
        });
    }
}
