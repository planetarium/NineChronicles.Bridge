import { Prisma, PrismaClient, ResponseType } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { SignedTx } from "../types/signed-tx";

export type PrismaTransactionClient = Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface BridgeResponse {
    signedTx: SignedTx;
    networkId: string;
    type: ResponseType;
    requestTxId: string;
}
