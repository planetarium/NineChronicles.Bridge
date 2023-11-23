import { Address } from "@planetarium/account";
import { encode } from "@planetarium/bencodex";
import { UnsignedTx } from "@planetarium/tx";
import { SignedTx, encodeSignedTx } from "@planetarium/tx/dist/tx";
import { IHeadlessGraphQLClient } from "../interfaces/headless-graphql-client";
import { ITxPool } from "../interfaces/txpool";

export class HeadlessTxPool implements ITxPool {
    constructor(private readonly client: IHeadlessGraphQLClient) {}

    stage(tx: SignedTx<UnsignedTx>): Promise<string> {
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
