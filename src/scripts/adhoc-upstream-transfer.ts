import { Address as LibplanetAddress } from "@planetarium/account";
import { encode } from "@planetarium/bencodex";
import { Currency, encodeSignedTx, signTx } from "@planetarium/tx";
import { Prisma, PrismaClient, RequestCategory, RequestType, ResponseType } from "@prisma/client";
import Decimal from "decimal.js";
import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import { getAccountFromEnv } from "../accounts";
import { getEnv, getRequiredEnv } from "../env";
import { HeadlessGraphQLClient } from "../headless-graphql-client";
import { PreloadHandler } from "../preload-handler";
import { encodeTransferAssetAction } from "../actions/transfer";
import { SUPER_FUTURE_DATETIME, additionalGasTxProperties } from "../tx";
import { getTxId } from "../utils/tx";
import { getNextTxNonce } from "../sync/utils";
import { z } from "zod";

type Args = {
    to: string;
    amount: string;
    decimals: number;
    memo?: string;
};

export function parseArgs(argv: string[]): Args {
    const map: Record<string, string> = {};
    for (let i = 0; i < argv.length; i += 1) {
        const key = argv[i];
        if (!key.startsWith("--")) {
            throw new Error(`Invalid argument: ${key}. Expected --key value form.`);
        }
        const value = argv[i + 1];
        if (value === undefined || value.startsWith("--")) {
            throw new Error(`Missing value for ${key}`);
        }
        map[key.slice(2)] = value;
        i += 1;
    }

    const schema = z.object({
        to: z.string().min(1),
        amount: z.string().min(1),
        decimals: z.coerce.number().int().min(0).max(30),
        memo: z.string().optional(),
    });

    return schema.parse(map);
}

export function parseLibplanetAddress(hex: string): LibplanetAddress {
    try {
        return LibplanetAddress.fromHex(hex, true);
    } catch {
        return LibplanetAddress.fromHex(hex, false);
    }
}

export function makeAdhocId(): string {
    // Node.js 16+ supports randomUUID, but keep a fallback.
    const uuid =
        typeof randomUUID === "function"
            ? randomUUID()
            : randomBytes(16).toString("hex");
    return `adhoc:${uuid}`;
}

export function parseDecimalToRawValue(amount: string, decimals: number): bigint {
    const d = new Decimal(amount);
    if (!d.isFinite()) {
        throw new Error(`Invalid --amount: ${amount}`);
    }
    if (d.isNeg()) {
        throw new Error("--amount must be non-negative.");
    }

    const scale = new Decimal(10).pow(decimals);
    const raw = d.mul(scale);
    if (!raw.isInteger()) {
        throw new Error(
            `--amount has more fractional digits than --decimals (${decimals}).`,
        );
    }
    return BigInt(raw.toFixed(0));
}

export function buildNcgCurrency(
    decimals: number,
    upstreamNcgMinter: LibplanetAddress,
): Currency {
    return {
        ticker: "NCG",
        decimalPlaces: decimals,
        totalSupplyTrackable: false,
        minters: new Set([upstreamNcgMinter.toBytes()]),
        maximumSupply: null,
    };
}

export async function main() {
    const args = parseArgs(process.argv.slice(2));

    // Ensure required envs exist early.
    getRequiredEnv("DATABASE_URL");
    getRequiredEnv("NC_REGISTRY_ENDPOINT");
    getRequiredEnv("NC_UPSTREAM_PLANET");
    getRequiredEnv("NC_DOWNSTREAM_PLANET");

    const [upstreamPlanet] = await new PreloadHandler().preparePlanets();
    const upstreamGQLClient = new HeadlessGraphQLClient(upstreamPlanet);
    const upstreamNetworkId = upstreamGQLClient.getPlanetID();

    const upstreamAccount = getAccountFromEnv("NC_UPSTREAM");
    const signerAddress = await upstreamAccount.getAddress();

    const recipient = parseLibplanetAddress(args.to);

    const upstreamNcgMinter = parseLibplanetAddress(
        getEnv("NC_UPSTREAM_NCG_MINTER") ||
            "47d082a115c63e7b58b1532d20e631538eafadde",
    );

    const currency = buildNcgCurrency(args.decimals, upstreamNcgMinter);
    const rawValue = parseDecimalToRawValue(args.amount, args.decimals);

    const genesisHash = Buffer.from(await upstreamGQLClient.getGenesisHash(), "hex");

    const prisma = new PrismaClient();
    await prisma.$connect();
    try {
        // Make sure Network row exists. (No schema change; safe idempotent.)
        await prisma.network.upsert({
            where: { id: upstreamNetworkId },
            create: { id: upstreamNetworkId },
            update: {},
        });

        const maxAttempts = 3;
        let lastError: unknown = null;
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            const lastBlock = await prisma.block.findFirst({
                where: { networkId: upstreamNetworkId },
                orderBy: { index: "desc" },
                select: { index: true },
            });
            if (!lastBlock) {
                throw new Error(
                    `No Block row exists for networkId=${upstreamNetworkId}. Run the bridge at least once so it scans blocks before using this ad-hoc script.`,
                );
            }

            const nonce = await prisma.$transaction(async (tx) => {
                return await getNextTxNonce(
                    tx as any,
                    upstreamGQLClient,
                    upstreamAccount,
                );
            });

            const action = encodeTransferAssetAction(
                recipient,
                signerAddress,
                { currency, rawValue },
                args.memo ?? null,
            );

            const unsignedTx = {
                nonce,
                genesisHash,
                publicKey: (await upstreamAccount.getPublicKey()).toBytes(
                    "uncompressed",
                ),
                signer: signerAddress.toBytes(),
                timestamp: SUPER_FUTURE_DATETIME,
                updatedAddresses: new Set([]),
                actions: [action],
                ...additionalGasTxProperties,
            };

            const signedTx = await signTx(unsignedTx as any, upstreamAccount);
            const serializedTx = encode(encodeSignedTx(signedTx));
            const raw = Buffer.from(serializedTx);
            const txid = getTxId(raw);

            const requestId = makeAdhocId();

            try {
                await prisma.$transaction(async (tx) => {
                    await tx.requestTransaction.create({
                        data: {
                            id: requestId,
                            category: RequestCategory.IGNORE,
                            type: RequestType.TRANSFER_ASSET,
                            networkId: upstreamNetworkId,
                            blockIndex: lastBlock.index,
                            sender: signerAddress.toString(),
                        },
                    });

                    await tx.responseTransaction.create({
                        data: {
                            id: txid,
                            nonce,
                            raw,
                            type: ResponseType.TRANSFER_ASSET,
                            networkId: upstreamNetworkId,
                            requestTransactionId: requestId,
                        },
                    });
                });

                console.log("Enqueued ad-hoc upstream transfer.");
                console.log("requestId:", requestId);
                console.log("networkId:", upstreamNetworkId);
                console.log("nonce:", nonce.toString());
                console.log("txid:", txid);
                console.log("to:", recipient.toString());
                console.log("amount:", args.amount);
                console.log("decimals:", args.decimals);
                console.log("rawValue:", rawValue.toString());
                if (args.memo) console.log("memo:", args.memo);
                return;
            } catch (e) {
                lastError = e;
                if (
                    e instanceof Prisma.PrismaClientKnownRequestError &&
                    e.code === "P2002"
                ) {
                    console.warn(
                        `Unique constraint conflict while inserting (attempt ${attempt}/${maxAttempts}). Retrying...`,
                    );
                    continue;
                }
                throw e;
            }
        }

        throw lastError instanceof Error
            ? lastError
            : new Error("Failed to enqueue after retries.");
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    main().catch((e) => {
        console.error(e);
        process.exitCode = 1;
    });
}

