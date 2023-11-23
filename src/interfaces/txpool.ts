import { Address } from "@planetarium/account";
import { SignedTx, UnsignedTx } from "@planetarium/tx/dist/tx";

export interface ITxPool {
    stage(tx: SignedTx<UnsignedTx>): Promise<string>;
    getNextTxNonce(address: Address): Promise<bigint>;
    getPlanetID(): string;
}

export const BackgroundSyncTxpoolSymbol = Symbol("IBackgroundSyncTxpool");

export interface IBackgroundSyncTxpool extends ITxPool {
    start(): void;
    stop(): void;
    [BackgroundSyncTxpoolSymbol]: true;
}

export function isBackgroundSyncTxpool(x: unknown): x is IBackgroundSyncTxpool {
    return (
        Object.getOwnPropertyDescriptor(x, BackgroundSyncTxpoolSymbol) !==
        undefined
    );
}
