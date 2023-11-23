import "dotenv/config";

import { HeadlessGraphQLClient } from "../headless-graphql-client";
import { heimdallClient } from "./heimdall-client";
import { createDb, getAll, run } from "./utils";
import { odinClient } from "./odin-client";

async function main() {
    const db = await createDb("/tmp/bridge-db");

    const txs = (await getAll(
        db,
        "SELECT requestTxId, responseTxId, responseTxStatus FROM txs",
    )) as {
        requestTxId: string;
        responseTxId: string;
        responseTxStatus: string;
    }[];

    for (const { responseTxId, responseTxStatus } of txs) {
        if (responseTxStatus === "SUCCESS") {
            continue;
        }

        let txStatus = (
            await heimdallClient.getTransactionResult(responseTxId)
        ).txStatus;
        console.log("heimdall", responseTxId, txStatus);

        if (txStatus === "INVALID") {
            // Try odin and logging
            txStatus = (await odinClient.getTransactionResult(responseTxId)).txStatus;
            console.log("odin", responseTxId, txStatus)
        }

        await run(
            db,
            "UPDATE txs SET responseTxStatus = ? WHERE responseTxId = ?",
            [txStatus, responseTxId],
        );
    }
}

main();
