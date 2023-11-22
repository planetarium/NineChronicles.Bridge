import { ISlackMessage, SlackMessageSymbol } from ".";

export class AppErrorEvent implements ISlackMessage {
    [SlackMessageSymbol] = true as const;

    constructor(private readonly error: Error) {}

    render() {
        if (this.error) {
            return {
                text: "App caught error",
                attachments: [
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
