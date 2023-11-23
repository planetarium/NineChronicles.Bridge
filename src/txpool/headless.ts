import { Address } from "@planetarium/account";
import { encode } from "@planetarium/bencodex";
import { encodeSignedTx } from "@planetarium/tx";
import { IHeadlessGraphQLClient } from "../interfaces/headless-graphql-client";
import { ITxPool } from "../interfaces/txpool";
import { SignedTx } from "../types/signed-tx";

export class HeadlessTxPool implements ITxPool {
    constructor(private readonly client: IHeadlessGraphQLClient) {}

    stage(tx: SignedTx): Promise<string> {
        return this.client.stageTransaction(
            Buffer.from(encode(encodeSignedTx(tx))).toString("hex"),
        );
    }

    async getNextTxNonce(address: Address): Promise<bigint> {
        return BigInt(await this.client.getNextTxNonce(address.toHex()));
    }

    getPlanetID(): string {
        return this.client.getPlanetID();
    }
}
