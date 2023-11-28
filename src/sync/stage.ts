import { Account } from "@planetarium/account";
import { PrismaClient } from "@prisma/client";
import { IHeadlessGraphQLClient } from "../interfaces/headless-graphql-client";

export async function stageTransactionFromDB(
    account: Account,
    client: PrismaClient,
    headlessGQLClient: IHeadlessGraphQLClient,
) {
    const networkId = headlessGQLClient.getPlanetID();
    const address = await account.getAddress();
    const txNonce = await headlessGQLClient.getNextTxNonce(address.toHex());
    const txs = await client.responseTransaction.findMany({
        select: {
            nonce: true,
            raw: true,
        },
        where: {
            networkId: networkId,
            nonce: {
                gte: txNonce,
            },
        },
    });

    for (const tx of txs) {
        console.log("Stage", tx.nonce, "at", networkId);
        await headlessGQLClient.stageTransaction(tx.raw.toString("hex"));
    }
}
