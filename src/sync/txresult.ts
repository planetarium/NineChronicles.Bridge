import { PrismaClient, TxResult } from "@prisma/client";
import { IHeadlessGraphQLClient } from "../headless-graphql-client";

const LIMIT = 10;

export async function updateTxStatuses(
    client: PrismaClient,
    headlessGQLClients: Record<string, IHeadlessGraphQLClient>,
) {
    const txs = await client.responseTransaction.findMany({
        select: {
            id: true,
            networkId: true,
        },
        where: {
            OR: [
                {
                    lastStatus: {
                        notIn: ["FAILURE", "SUCCESS"],
                    },
                },
                {
                    lastStatus: null,
                },
            ],
        },
        orderBy: {
            statusUpdatedAt: "asc",
        },
        take: LIMIT,
    });

    const txResults = await Promise.all(
        txs.map((tx) => getTxResult(headlessGQLClients, tx)),
    );

    await client.$transaction(
        txs.map((transaction, index) =>
            client.responseTransaction.update({
                where: { id: transaction.id },
                data: {
                    lastStatus: txResults[index],
                    statusUpdatedAt: new Date(),
                },
            }),
        ),
    );
}

async function getTxResult(
    clients: Record<string, IHeadlessGraphQLClient>,
    tx: { networkId: string; id: string },
): Promise<TxResult> {
    if (clients[tx.networkId] === undefined) {
        return TxResult.INVALID;
    }

    const txResult = await clients[tx.networkId].getTransactionResult(tx.id);
    return txResult.txStatus;
}
