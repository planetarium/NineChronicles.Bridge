import { Prisma, PrismaClient, TxResult } from "@prisma/client";
import { IHeadlessGraphQLClient } from "../headless-graphql-client";

const LIMIT = 10;

export async function updateTxStatuses(
    client: PrismaClient,
    headlessGQLClients: Record<string, IHeadlessGraphQLClient>,
) {
    // NOTE: Raw SQL on purpose. Prisma's findMany sends the enum values as
    // bind parameters (CAST($1::text AS "TxResult")), which Postgres cannot
    // match against the partial index `ix_resptx_pending` (see the comment on
    // ResponseTransaction in prisma/schema.prisma), so every 5-second poll
    // became a full seq scan + sort of the table. With literal enum values the
    // predicate textually matches the index and the planner can use it.
    // Do not parameterize the enum literals below.
    const txs = await client.$queryRaw<{ id: string; networkId: string }[]>`
        SELECT "id", "networkId"
        FROM "ResponseTransaction"
        WHERE ("lastStatus" NOT IN ('FAILURE', 'SUCCESS') OR "lastStatus" IS NULL)
        ORDER BY "statusUpdatedAt" ASC
        LIMIT ${Prisma.raw(String(LIMIT))}
    `;

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
