import "dotenv/config";

import { HeadlessGraphQLClient } from "../headless-graphql-client";
import { heimdallClient } from "./heimdall-client";
import { createDb, getAll, run } from "./utils";

async function main() {
    const db = await createDb("/tmp/bridge-db");

    const txs = (await getAll(
        db,
        "SELECT requestTxId, responseTxId FROM txs",
    )) as {
        requestTxId: string;
        responseTxId: string;
    }[];

    for (const { responseTxId } of txs) {
        const txStatus = (
            await heimdallClient.getTransactionResult(responseTxId)
        ).txStatus;
        console.log(responseTxId, txStatus);
        await run(
            db,
            "UPDATE txs SET responseTxStatus = ? WHERE responseTxId = ?",
            [txStatus, responseTxId],
        );
    }
}

main();
