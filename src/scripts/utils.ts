import { Database } from "sqlite3";

async function initializeDb(db: Database) {
    const CREATE_TABLE_QUERY = `CREATE TABLE IF NOT EXISTS txs (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        requestTxId TEXT NOT NULL,
        responseTxId TEXT NOT NULL,
        responseTxStatus TEXT DEFAULT "INVALID" NOT NULL,
        recoverTxId TEXT
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

export async function createDb(path: string) {
    const database = new Database(path);
    await initializeDb(database);
    return database;
}

export async function getAll(
    database: Database,
    query: string,
): Promise<unknown> {
    return new Promise((resolve, error) => {
        database.all(query, (e, rows) => {
            if (e) {
                error();
            } else {
                resolve(rows);
            }
        });
    });
}

export async function run(
    database: Database,
    query: string,
    params: unknown[],
): Promise<void> {
    return new Promise((resolve, error) => {
        database.run(query, params, (e) => {
            if (e) {
                error();
            } else {
                resolve();
            }
        });
    });
}
