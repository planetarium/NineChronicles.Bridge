import { Account, Address } from "@planetarium/account";
import { RecordView } from "@planetarium/bencodex";
import { signTx } from "@planetarium/tx";
import { Mutex } from "async-mutex";
import { ITxPool } from "./interfaces/txpool";
import { additionalGasTxProperties } from "./tx";
import { BlockHash } from "./types/block-hash";

const SUPER_FUTURE_DATETIME = new Date(2200, 12, 31, 23, 59, 59, 999);

export class Signer {
    private readonly _txpool: ITxPool;
    private readonly _account: Account;
    private readonly _genesisBlockHash: BlockHash;
    private readonly mutex: Mutex;

    constructor(
        account: Account,
        txpool: ITxPool,
        genesisBlockHash: BlockHash,
    ) {
        this._account = account;
        this._txpool = txpool;
        this._genesisBlockHash = genesisBlockHash;
        this.mutex = new Mutex();
    }

    async getAddress(): Promise<Address> {
        return this._account.getAddress();
    }

    getSignPlanet(): string {
        return this._txpool.getPlanetID();
    }

    async sendTx(action: RecordView): Promise<string> {
        const address = await this._account.getAddress();
        return this.mutex.runExclusive(async () => {
            const nonce = BigInt(await this._txpool.getNextTxNonce(address));
            const genesisHash = Buffer.from(this._genesisBlockHash, "hex");

            const unsignedTx = {
                nonce,
                genesisHash,
                publicKey: (await this._account.getPublicKey()).toBytes(
                    "uncompressed",
                ),
                signer: address.toBytes(),
                timestamp: SUPER_FUTURE_DATETIME,
                updatedAddresses: new Set([]),
                actions: [action],
                ...additionalGasTxProperties,
            };

            const tx = await signTx(unsignedTx, this._account);
            return this._txpool.stage(tx);
        });
    }
}
