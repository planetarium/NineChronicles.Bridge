import { ISlackMessage, SlackMessageSymbol } from ".";
import { TxIdWithNetwork, ncscanTxLinkGetter } from "./utils";
export class BridgeEvent implements ISlackMessage {
    [SlackMessageSymbol] = true as const;

    constructor(
        private readonly actionType: 'BURN' | 'MINT' | 'TRANSFER',
        private readonly requestTx: TxIdWithNetwork,
        private readonly responseTx: TxIdWithNetwork,
    ) { }

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
                    value: `${this.requestTx[0]} → ${this.responseTx[0]}`
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