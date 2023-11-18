import { Account, PublicKey, RawPrivateKey } from "@planetarium/account";
import { AwsKmsAccount, KMSClient } from "@planetarium/account-aws-kms";
import { getRequiredEnv } from "../env";

type AllowedEnvPrefix = "NC_UPSTREAM" | "NC_DOWNSTREAM";
type AccountType = "RAW" | "KMS";

function getAccountTypeFromEnv(prefix: AllowedEnvPrefix): AccountType {
    const envKey = `${prefix}_ACCOUNT_TYPE` as const;
    const keyType = process.env[envKey];
    if (keyType === undefined) {
        return "RAW";
    } else if (keyType === "KMS") {
        return "KMS";
    }

    throw new TypeError(`${envKey} should be one between 'RAW' or 'KMS'.`);
}

export function getAccountFromEnv(prefix: AllowedEnvPrefix): Account {
    const accountType = getAccountTypeFromEnv(prefix);

    if (accountType === "RAW") {
        const rawPrivateKeyHex = getRequiredEnv(`${prefix}_PRIVATE_KEY`);

        return RawPrivateKey.fromHex(rawPrivateKeyHex);
    }

    if (accountType === "KMS") {
        const keyId = getRequiredEnv(`${prefix}__KMS__KEY_ID`);
        const publicKeyHex = getRequiredEnv(`${prefix}__KMS__PUBLIC_KEY`);

        const publicKey = PublicKey.fromHex(publicKeyHex, "uncompressed");

        return new AwsKmsAccount(keyId, publicKey, new KMSClient());
    }

    throw new TypeError(`Unhandled accountType: ${accountType}`);
}
