import { Address } from "@planetarium/account";
import { IHeadlessGraphQLClient } from "../headless-graphql-client";
import { AssetTransferredEvent } from "../types/asset-transferred-event";
import { TransactionLocation } from "../types/transaction-location";

export type ValidatedAssetTransferredEvent = Omit<AssetTransferredEvent, "memo"> & {
    targetAddress: Address;
};

export async function getAssetTransferredEvents(
    headlessGraphQLClient: IHeadlessGraphQLClient,
    recipient: Address,
    blockIndex: number,
): Promise<(ValidatedAssetTransferredEvent & TransactionLocation)[]> {
    const planetID = headlessGraphQLClient.getPlanetID();
    const blockHash = await headlessGraphQLClient.getBlockHash(blockIndex);
    const events = await headlessGraphQLClient.getAssetTransferredEvents(
        blockIndex,
        recipient,
    );

    const successEvents: ValidatedAssetTransferredEvent[] = [];
    for (const event of events) {
        const { txStatus } = await headlessGraphQLClient.getTransactionResult(
            event.txId,
        );
        if (event.memo === null) {
            continue;
        }

        let targetAddress;
        try {
            targetAddress = Address.fromHex(event.memo, true);
        } catch {
            continue;
        }

        if (txStatus === "SUCCESS") {
            successEvents.push({
                ...event,
                targetAddress,
            });
        }
    }

    return successEvents.map((ev) => {
        return { blockHash, planetID, ...ev };
    });
}
