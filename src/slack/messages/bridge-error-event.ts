import { ISlackMessage, SlackMessageSymbol } from ".";
import { TxIdWithNetwork, ncscanTxLinkGetter } from "./utils";

export class BridgeErrorEvent implements ISlackMessage {
    [SlackMessageSymbol] = true as const;

    constructor(
        private readonly tx: TxIdWithNetwork,
        private readonly error: Error,
    ) {}

    render() {
        if (this.error) {
            return {
                text: "Bridge failed",
                attachments: [
                    {
                        title: "Tx",
                        text: ncscanTxLinkGetter(this.tx),
                    },
                    {
                        title: "Type",
                        color: "#ff0033",
                        text: this.error.constructor.name,
                    },
                    {
                        title: "Name",
                        color: "#ff0033",
                        text: this.error.name,
                    },
                    {
                        title: "Message",
                        color: "#ff0033",
                        text: this.error.message,
                    },
                    {
                        title: "Stack",
                        color: "#ff0033",
                        text: this.error.stack,
                    },
                ],
            };
        }
    }
}
