import { Account } from "@planetarium/account";
import { IHeadlessGraphQLClient } from "../interfaces/headless-graphql-client";
import { PrismaTransactionClient } from "./types";

export async function getNextTxNonce(
    tx: PrismaTransactionClient,
    headlessGQLClient: IHeadlessGraphQLClient,
    account: Account,
): Promise<bigint> {
    const networkId = headlessGQLClient.getPlanetID();
    const address = await account.getAddress();
    const lastTx = await tx.responseTransaction.findFirst({
        select: {
            nonce: true,
        },
        where: {
            networkId,
        },
        orderBy: {
            nonce: "desc",
        },
    });

    if (lastTx !== undefined) {
        return lastTx.nonce + 1n;
    }

    return BigInt(
        (await headlessGQLClient.getNextTxNonce(address.toHex())) - 1,
    );
}

export async function getNextBlockIndex(
    tx: PrismaTransactionClient,
    defaultStartBlockIndex: bigint,
): Promise<bigint> {
    const block = await tx.block.findFirst({
        select: {
            index: true,
        },
        orderBy: {
            index: "desc",
        },
    });

    return block === undefined ? defaultStartBlockIndex : block.index;
}
