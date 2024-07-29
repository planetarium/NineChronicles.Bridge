import { Account } from "@planetarium/account";
import { ResponseType } from "@prisma/client";
import { IHeadlessGraphQLClient } from "../headless-graphql-client";
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

    if (lastTx) {
        return lastTx.nonce + 1n;
    }

    return BigInt(await headlessGQLClient.getNextTxNonce(address.toHex()));
}

export async function getNextBlockIndex(
    tx: PrismaTransactionClient,
    networkId: string,
    defaultStartBlockIndex: bigint,
): Promise<bigint> {
    const block = await tx.block.findFirst({
        select: {
            index: true,
        },
        where: {
            networkId,
        },
        orderBy: {
            index: "desc",
        },
    });

    if (block) {
        return block.index + 1n;
    }

    return defaultStartBlockIndex;
}
