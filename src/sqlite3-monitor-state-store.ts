import { promisify } from "util";
import { Database } from "sqlite3";
import { IMonitorStateStore } from "./interfaces/monitor-state-store";
import { BlockHash } from "./types/block-hash";

export class Sqlite3MonitorStateStore implements IMonitorStateStore {
    private readonly _database: Database;
    private closed: boolean;

    private constructor(database: Database) {
        this._database = database;
        this.closed = false;
    }

    static async open(path: string): Promise<Sqlite3MonitorStateStore> {
        const database = new Database(path);
        await this.initialize(database);
        return new Sqlite3MonitorStateStore(database);
    }

    private static async initialize(database: Database): Promise<void> {
        const CREATE_TABLE_QUERY = `CREATE TABLE IF NOT EXISTS monitor_states (
            network TEXT PRIMARY KEY,
            block_hash TEXT NOT NULL
        )`;
        return new Promise((resolve, error) => {
            database.run(CREATE_TABLE_QUERY, (e) => {
                if (e) {
                    error();
                } else {
                    resolve();
                }
            });
        });
    }

    store(network: string, blockHash: BlockHash): Promise<void> {
        this.checkClosed();

        const run: (sql: string, params: unknown[]) => Promise<void> =
            promisify(this._database.run.bind(this._database));
        return run(
            "INSERT OR REPLACE INTO monitor_states(network, block_hash) VALUES (?, ?)",
            [network, blockHash],
        );
    }

    async load(network: string): Promise<BlockHash | null> {
        this.checkClosed();
        const get: (
            sql: string,
            params: unknown[],
        ) => Promise<{ block_hash: string } | undefined> = promisify(
            this._database.get.bind(this._database),
        );
        const row = await get(
            "SELECT block_hash FROM monitor_states WHERE network = ?",
            [network],
        );

        if (row === undefined) {
            return null;
        }

        return row.block_hash;
    }

    close(): void {
        this.checkClosed();

        this._database.close();
        this.closed = true;
    }

    private checkClosed(): void {
        if (this.closed) {
            throw new Error(
                "This internal SQLite3 database is already closed.",
            );
        }
    }
}
