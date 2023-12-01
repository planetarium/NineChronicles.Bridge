import { ISlackMessage, SlackMessageSymbol } from ".";
import { TxIdWithNetwork, ncscanTxLinkGetter } from "./utils";

export type BridgeEventActionType = "BURN" | "MINT" | "TRANSFER";

export class BridgeEvent implements ISlackMessage {
    [SlackMessageSymbol] = true as const;

    constructor(
        private readonly actionType: "BURN" | "MINT" | "TRANSFER",
        private readonly requestTx: TxIdWithNetwork,
        private readonly responseTx: TxIdWithNetwork,
        private readonly sender: string,
        private readonly recipient: string,
    ) {}

    render() {
        const txLinkGetter = ncscanTxLinkGetter;
        const responseTxAttachments = {
            title: `Response Tx (${this.actionType})`,
            text: txLinkGetter(this.responseTx),
        };
        return {
            text: "Bridge Event Occurred.",
            attachments: [
                {
                    title: "Source - Destination",
                    text: `${this.requestTx[0]} → ${this.responseTx[0]}`,
                },
                {
                    title: "Sender - Recipient",
                    text: `${this.sender} -> ${this.recipient}`,
                },
                {
                    title: "Request Tx",
                    text: txLinkGetter(this.requestTx),
                },
                responseTxAttachments,
            ],
            fallback: "Bridge Event Occurred.",
        };
    }
}
