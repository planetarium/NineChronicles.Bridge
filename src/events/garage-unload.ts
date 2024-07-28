import { Address } from "@planetarium/account";
import { IHeadlessGraphQLClient } from "../headless-graphql-client";
import { GarageUnloadEvent } from "../types/garage-unload-event";

export type ValidatedGarageUnloadEvent = Omit<GarageUnloadEvent, "memo"> & {
    parsedMemo: {
        agentAddress: Address;
        avatarAddress: Address;
        memo: string | null;
    };
};

export async function getGarageUnloadEvents(
    headlessGraphQLClient: IHeadlessGraphQLClient,
    agentAddress: Address,
    avatarAddress: Address,
    blockIndex: number,
): Promise<ValidatedGarageUnloadEvent[]> {
    const planetID = headlessGraphQLClient.getPlanetID();
    const blockHash = await headlessGraphQLClient.getBlockHash(blockIndex);
    const events = await headlessGraphQLClient.getGarageUnloadEvents(
        blockIndex,
        agentAddress,
        avatarAddress,
    );

    const successEvents: ValidatedGarageUnloadEvent[] = [];
    for (const event of events) {
        if (
            event.fungibleAssetValues.length + event.fungibleItems.length ===
            0
        ) {
            continue;
        }

        const { txStatus } = await headlessGraphQLClient.getTransactionResult(
            event.txId,
        );
        if (txStatus !== "SUCCESS") {
            continue;
        }

        let parsedMemo = null;
        try {
            if (event.memo === null) {
                console.error(
                    `Skip ${event.txId} because event.memo field is required but null.`
                );
                continue;
            }
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
    agentAddress: Address;
    avatarAddress: Address;
    memo: string | null;
} {
    const parsed = JSON.parse(memo);

    if (typeof parsed[2] !== "string" && parsed[2] !== null) {
        throw new TypeError();
    }

    return {
        agentAddress: Address.fromHex(parsed[0], true),
        avatarAddress: Address.fromHex(parsed[1], true),
        memo: parsed[2],
    };
}
