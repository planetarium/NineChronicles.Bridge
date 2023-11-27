import { getRequiredEnv } from "../env";
import { IHeadlessGraphQLClient } from "../interfaces/headless-graphql-client";
import { ITxPool } from "../interfaces/txpool";
import { HeadlessTxPool } from "./headless";
import { LocalTxPool } from "./local";

type AllowedEnvPrefix = "NC_UPSTREAM" | "NC_DOWNSTREAM";
type TxpoolType = "HEADLESS" | "LOCAL";

function getTxpoolTypeFromEnv(prefix: AllowedEnvPrefix): TxpoolType {
    const envKey = `${prefix}__TXPOOL__TYPE` as const;
    const keyType = process.env[envKey] || "HEADLESS";
    if (keyType === "HEADLESS") {
        return "HEADLESS";
    } else if (keyType === "LOCAL") {
        return "LOCAL";
    }

    throw new TypeError(
        `${envKey} should be one between 'HEADLESS' or 'LOCAL'.`,
    );
}

export function getTxpoolFromEnv(
    prefix: AllowedEnvPrefix,
    client: IHeadlessGraphQLClient,
): ITxPool {
    const txpoolType = getTxpoolTypeFromEnv(prefix);

    if (txpoolType === "LOCAL") {
        const path = getRequiredEnv(`${prefix}__LOCAL_TXPOOL__PATH`);

        return new LocalTxPool(path, client);
    }

    if (txpoolType === "HEADLESS") {
        return new HeadlessTxPool(client);
    }

    throw new TypeError(`Unhandled accountType: ${txpoolType}`);
}
