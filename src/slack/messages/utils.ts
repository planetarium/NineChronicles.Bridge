import { TxId } from "../../types/txid";

export type BridgeEventType = "bridge" | "refund";

export type Network =
    | "odin"
    | "heimdall"
    | "idun"
    | "thor"
    | "odin-internal"
    | "heimdall-internal"
    | "idun-internal"
    | "thor-internal";

export const planetIDToName = (planetID: string) => {
    switch (planetID) {
        case "0x000000000000":
            return "odin";
        case "0x000000000001":
            return "heimdall";
        case "0x000000000002":
            return "idun";
        case "0x000000000003":
            return "thor";
        case "0x100000000000":
            return "odin-internal";
        case "0x100000000001":
            return "heimdall-internal";
        case "0x100000000002":
            return "idun-internal";
        case "0x100000000003":
            return "thor-internal";
        default:
            return planetID;
    }
};
export type TxIdWithNetwork = [planetID: string, TxId];
type TxLinkGetter = (tx: TxIdWithNetwork) => string;

export function ncscanTxLinkGetter(tx: TxIdWithNetwork): string {
    const [planetID, txId] = tx;
    const network = planetIDToName(planetID);
    if (network === "odin") {
        return `https://9cscan.com/tx/${txId}`;
    }

    if (network === "odin-internal") {
        return `https://internal.9cscan.com/tx/${txId}`;
    }

    if (network === "heimdall") {
        return `https://heimdall.9cscan.com/tx/${txId}`;
    }

    if (network === "heimdall-internal") {
        return `https://internal-heimdall.9cscan.com/tx/${txId}`;
    }

    if (network === "idun") {
        return `https://idun.9cscan.com/tx/${txId}`;
    }

    if (network === "idun-internal") {
        return `https://idun-internal.9cscan.com/tx/${txId}`;
    }

    if (network === "thor") {
        return `https://thor.9cscan.com/tx/${txId}`;
    }

    if (network === "thor-internal") {
        return `https://thor.9cscan.com/tx/${txId}`;
    }

    throw new TypeError(`Unexpected network type: ${network}`);
}
