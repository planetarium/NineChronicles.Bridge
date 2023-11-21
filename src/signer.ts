import { Account, Address } from "@planetarium/account";
import { RecordView, encode } from "@planetarium/bencodex";
import { encodeSignedTx, signTx } from "@planetarium/tx";
import { Mutex } from "async-mutex";
import { IHeadlessGraphQLClient } from "./interfaces/headless-graphql-client";
import { additionalGasTxProperties } from "./tx";

export class Signer {
    private readonly _client: IHeadlessGraphQLClient;
    private readonly _account: Account;
    private readonly mutex: Mutex;

    constructor(account: Account, client: IHeadlessGraphQLClient) {
        this._account = account;
        this._client = client;
        this.mutex = new Mutex();
    }

    async getAddress(): Promise<Address> {
        return this._account.getAddress();
    }

    getSignPlanet(): string {
        return this._client.getPlanetID();
    }

    async sendTx(action: RecordView): Promise<string> {
        const address = await this._account.getAddress();
        return this.mutex.runExclusive(async () => {
            const nonce = BigInt(
                await this._client.getNextTxNonce(address.toHex()),
            );
            const genesisHash = Buffer.from(
                await this._client.getGenesisHash(),
                "hex",
            );

            const unsignedTx = {
                nonce,
                genesisHash,
                publicKey: (await this._account.getPublicKey()).toBytes(
                    "uncompressed",
                ),
                signer: address.toBytes(),
                timestamp: new Date(),
                updatedAddresses: new Set([]),
                actions: [action],
                ...additionalGasTxProperties,
            };

            const tx = await signTx(unsignedTx, this._account);
            return this._client.stageTransaction(
                Buffer.from(encode(encodeSignedTx(tx))).toString("hex"),
            );
        });
    }
}
