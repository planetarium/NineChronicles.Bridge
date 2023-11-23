import "dotenv/config";

import { promisify } from "node:util";
import { WebClient } from "@slack/web-api";
import { Database } from "sqlite3";
import { getRequiredEnv } from "../env";
import { request } from "node:http";

const CHANNEL_NAME = getRequiredEnv("SLACK__CHANNEL");
const webClient = new WebClient(getRequiredEnv("SLACK__BOT_TOKEN"));

async function getChannelIdByName(name: string) {
    let cursor = undefined;
    while (true) {
        const channelsResp = await webClient.conversations.list({
            exclude_archived: true,
            cursor,
        });

        const channels = channelsResp.channels;
        if (!channels) {
            console.error("failed to get channels", channels);
            process.exit(-1);
        }

        const channel = channels.find((x) => x.name === name);
        if (channel) {
            return channel.id;
        }

        cursor = channelsResp.response_metadata.next_cursor;
    }
}

async function initializeDb(db: Database) {
    const CREATE_TABLE_QUERY = `CREATE TABLE IF NOT EXISTS txs (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        requestTxId TEXT NOT NULL,
        responseTxId TEXT NOT NULL,
        responseTxStatus TEXT DEFAULT "INVALID" NOT NULL,
        recoverTxId TEXT,
        UNIQUE(requestTxId, responseTxId)
    )`;

    return new Promise((resolve, error) => {
        db.run(CREATE_TABLE_QUERY, (e) => {
            if (e) {
                error();
            } else {
                resolve();
            }
        });
    });
}

async function createDb(path: string) {
    const database = new Database(path);
    await initializeDb(database);
    return database;
}

async function main() {
    const channelId = await getChannelIdByName(CHANNEL_NAME);
    const db = await createDb("/tmp/bridge-db");
    const run: (sql: string, params: unknown[]) => Promise<void> = promisify(
        db.run.bind(db),
    );
    let cursor = undefined;
    while (true) {
        console.log("cursor", cursor);
        const { messages, response_metadata } =
            await webClient.conversations.history({
                channel: channelId,
                cursor,
            });

        for (const message of messages) {
            if (
                message.type !== "message" ||
                message.subtype !== "bot_message" ||
                message.username !== "Relay Bridge (Odin ↔ Heimdall)" ||
                !message.attachments
            ) {
                continue;
            }

            const requestTxLink = message.attachments.find(
                (x) => x.title === "Request Tx",
            )?.text;
            const responseTxLink = message.attachments.find((x) =>
                x.title.startsWith("Response Tx"),
            )?.text;

            if (requestTxLink === undefined || responseTxLink === undefined) {
                continue;
            }

            const requestTxId = requestTxLink
                .split("/")
                .at(-1)
                .replace(">", "");
            const responseTxId = responseTxLink
                .split("/")
                .at(-1)
                .replace(">", "");

            await run(
                "INSERT INTO txs(requestTxId,responseTxId) VALUES (?,?)",
                [requestTxId, responseTxId],
            );
            // console.log(requestTxId, responseTxId);
        }

        if (!response_metadata?.next_cursor) {
            break;
        }

        cursor = response_metadata.next_cursor;
    }
}

main();
