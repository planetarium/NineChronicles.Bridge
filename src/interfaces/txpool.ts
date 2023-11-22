import { Address } from "@planetarium/account";
import { SignedTx, UnsignedTx } from "@planetarium/tx/dist/tx";

export interface ITxPool {
    stage(tx: SignedTx<UnsignedTx>): Promise<string>;
    getNextTxNonce(address: Address): Promise<bigint>;
    getPlanetID(): string;
}
