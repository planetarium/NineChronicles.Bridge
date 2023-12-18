import { Address } from "@planetarium/account";
import { IHeadlessGraphQLClient } from "../headless-graphql-client";
import { AssetTransferredEvent } from "../types/asset-transferred-event";
import { TransactionLocation } from "../types/transaction-location";

export async function getAssetTransferredEvents(
    headlessGraphQLClient: IHeadlessGraphQLClient,
    recipient: Address,
    blockIndex: number,
): Promise<(AssetTransferredEvent & TransactionLocation)[]> {
    const planetID = headlessGraphQLClient.getPlanetID();
    const blockHash = await headlessGraphQLClient.getBlockHash(blockIndex);
    const events = await headlessGraphQLClient.getAssetTransferredEvents(
        blockIndex,
        recipient,
    );

    const successEvents: AssetTransferredEvent[] = [];
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
