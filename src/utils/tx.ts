import { createHash } from "node:crypto";

export function getTxId(raw: Uint8Array): string {
    return createHash("sha256").update(raw).digest().toString("hex");
}
