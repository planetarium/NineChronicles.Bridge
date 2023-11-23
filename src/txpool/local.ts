import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { Address } from "@planetarium/account";
import { encode } from "@planetarium/bencodex";
import { encodeSignedTx } from "@planetarium/tx";
import { Mutex } from "async-mutex";
import { IHeadlessGraphQLClient } from "../interfaces/headless-graphql-client";
import {
    BackgroundSyncTxpoolSymbol,
    IBackgroundSyncTxpool,
} from "../interfaces/txpool";
import { SignedTx } from "../types/signed-tx";
import { delay } from "../utils/delay";
import { getTxId } from "../utils/tx";

type Journal = Record<
    string, // address, lower hex
    [number, string][] // nonce, tx-hexstring
>;

export class LocalTxPool implements IBackgroundSyncTxpool {
    [BackgroundSyncTxpoolSymbol] = true as const;

    private running: boolean;
    private readonly mutex: Mutex;

    constructor(
        private readonly journalPath: string,
        private readonly client: IHeadlessGraphQLClient,
    ) {
        this.running = false;
        this.mutex = new Mutex();
    }

    async stage(tx: SignedTx): Promise<string> {
        const debug = this.debugForContext("stage");
        const error = this.errorForContext("stage");
        const [txid, serializedTx] = await this.mutex.runExclusive(async () => {
            const journal = await this.readJournal();

            const rawSerializedTx = encode(encodeSignedTx(tx));
            const serializedTx = Buffer.from(rawSerializedTx).toString("hex");
            const signer = Buffer.from(tx.signer).toString("hex").toLowerCase();
            if (journal[signer] === undefined) {
                journal[signer] = [];
            }

            journal[signer].push([Number(tx.nonce), serializedTx]);

            const txid = getTxId(rawSerializedTx);
            debug(`Try to record ${signer}/${tx.nonce}-${txid} to journal`);
            await this.writeJournal(journal);
            debug(`Recorded ${signer}/${tx.nonce}-${txid} to journal`);

            return [txid, serializedTx];
        });

        try {
            return await this.client.stageTransaction(serializedTx);
        } catch (e) {
            error(
                "Failed to stage",
                txid,
                "But ignore because it is recorded in journal.",
            );
            return txid;
        }
    }

    async getNextTxNonce(address: Address): Promise<bigint> {
        return this.mutex.runExclusive(async () => {
            const journal = await this.readJournal();
            const addressString = address.toHex("lower");
            if (
                journal[addressString] === undefined ||
                journal[addressString].length === 0
            ) {
                return BigInt(
                    await this.client.getNextTxNonce(address.toHex()),
                );
            }

            // txs will have one more items.
            const txs = journal[addressString];

            this.debug("nextTxNonce", JSON.stringify(txs));
            return BigInt(Math.max(...txs.map(([nonce]) => nonce)) + 1);
        });
    }

    getPlanetID(): string {
        return this.client.getPlanetID();
    }

    start(): void {
        this.running = true;
        this.backgroundSync();
    }

    stop(): void {
        this.running = false;
    }

    private async backgroundSync(): Promise<void> {
        const debug = this.debugForContext(
            `backgroundSync@${this.journalPath}`,
        );
        const error = this.errorForContext(
            `backgroundSync@${this.journalPath}`,
        );
        const DELAY_MILLISECONDS = 10000;
        while (this.running) {
            await delay(DELAY_MILLISECONDS);

            // Prevents to stop sync loop by unexpected error.
            try {
                debug("Start iteration.");
                // Read
                const journal = await this.mutex.runExclusive(async () => {
                    return await this.readJournal();
                });

                // Fetch txresults
                const txToStatus: Map<string, string> = new Map();
                for (const address of Object.keys(journal)) {
                    const txs = journal[address];
                    for (const [nonce, tx] of txs) {
                        const txid = getTxId(Buffer.from(tx, "hex"));
                        const txResult =
                            await this.client.getTransactionResult(txid);
                        debug(`${txid}'s txresult is ${txResult.txStatus}`);
                        txToStatus.set(tx, txResult.txStatus);
                        if (
                            txResult.txStatus !== "SUCCESS" &&
                            txResult.txStatus !== "FAILURE"
                        ) {
                            debug(
                                `${address}/${nonce}-${txid} seems not included in blocks. Stage again.`,
                            );

                            try {
                                await this.client.stageTransaction(tx);
                            } catch (e) {
                                error("Failed to stage", txid, "But skip now.");
                            }
                        }
                    }
                }

                // Remove txs having nonce smaller than remote nextTxNonce.
                await this.mutex.runExclusive(async () => {
                    const journal = await this.readJournal();
                    const newJournal: Journal = {};

                    for (const address of Object.keys(journal)) {
                        const txs = structuredClone(journal[address]);

                        // It will skip when there are only one or zero txs.
                        if (txs.length <= 1) {
                            debug(
                                `Skip filtering because journal[${address}] has txs less or equal than 1.`,
                                txs,
                            );
                            newJournal[address] = txs;
                            continue;
                        }

                        // Sort acsending
                        txs.sort(([a], [b]) => (a < b ? -1 : 1));

                        const txStatuses = txs.map(([, tx]) =>
                            txToStatus.has(tx) ? txToStatus.get(tx) : "INVALID",
                        );

                        const index = txStatuses.findIndex(
                            (txStatus) =>
                                txStatus !== "SUCCESS" &&
                                txStatus !== "FAILURE",
                        );

                        // If [SUCCESS, SUCCESS, FAILURE, INVALID, SUCCESS],
                        // index will be 3 and newJournal[address] will be [INVALID, SUCCESS].
                        // If [SUCCESS, SUCCESS],
                        // index will be -1 and [1, 2, 3].slice(-1) == [3] (Try in Nodejs REPL)
                        newJournal[address] = txs.slice(index);

                        const droppedTxsCount =
                            journal[address].length -
                            newJournal[address].length;
                        debug(
                            `Dropped ${address}'s ${droppedTxsCount} txs from journal because they are included in chain blocks.`,
                        );

                        // If [SUCCESS, SUCCESS], newJournal[address] will be [SUCCESS].
                        // In theory, you'll never get to this point, but it's there just in case.
                        // Remain latest one.
                        if (
                            newJournal[address].length === 0 &&
                            journal[address].length > 0
                        ) {
                            const maxNonce = Math.max(
                                ...journal[address].map(([nonce]) => nonce),
                            );
                            newJournal[address] = [
                                journal[address].find(
                                    ([nonce]) => nonce === maxNonce,
                                ),
                            ];
                            debug(
                                "Remain the latest tx",
                                JSON.stringify(newJournal[address]),
                            );
                        }
                    }

                    await this.writeJournal(newJournal);
                });
            } catch (e) {
                error(
                    "Unexpected error occurred while startSync loop. Ignore. error:",
                    e,
                );
            }
        }

        debug("loop ended.");
    }

    private async readJournal(): Promise<Journal> {
        const debug = this.debugForContext(`readJournal@${this.journalPath}`);
        const error = this.errorForContext(`readJournal@${this.journalPath}`);

        debug("readJournal start.");

        if (!existsSync(this.journalPath)) {
            debug("jouranl doesn't exist. Returns empty ({}).");
            return {};
        }

        const journalFile = await readFile(this.journalPath, {
            encoding: "utf-8",
        });

        try {
            debug("Try to parse journalFile as JSON.");
            const parsed = JSON.parse(journalFile);
            debug("readJournal returns.", parsed);
            return parsed;
        } catch (e) {
            error("Failed to parse journalFile as JSON. Re-raise.", e);
            throw e;
        }
    }

    private async writeJournal(journal: Journal): Promise<void> {
        const debug = this.debugForContext(`writeJournal@${this.journalPath}`);
        const error = this.debugForContext(`writeJournal@${this.journalPath}`);
        this.debug("writeJournal called.");
        try {
            debug("Try to write journal", journal);
            await writeFile(this.journalPath, JSON.stringify(journal));
            debug("writeJournal ended.");
        } catch (e) {
            error(
                "Failed to write journal.",
                journal,
                "at",
                this.journalPath,
                " Re-raise.",
            );
            throw e;
        }
    }

    private log(...params: unknown[]) {
        console.log("[LocalTxPool]", ...params);
    }

    private debug(...params: unknown[]) {
        console.debug("[LocalTxPool]", ...params);
    }

    private error(...params: unknown[]) {
        console.error("[LocalTxPool]", ...params);
    }

    private debugForContext(context): (...params: unknown[]) => void {
        return (...params: unknown[]) => this.debug(`[${context}]`, ...params);
    }

    private errorForContext(context): (...params: unknown[]) => void {
        return (...params: unknown[]) => this.error(`${context}`, ...params);
    }
}
