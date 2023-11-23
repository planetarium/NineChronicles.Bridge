import type { signTx } from "@planetarium/tx";

// FIXME: @planetarium/tx should export SignedTx
export type SignedTx = Awaited<ReturnType<typeof signTx>>;
