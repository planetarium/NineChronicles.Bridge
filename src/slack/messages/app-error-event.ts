import { ISlackMessage, SlackMessageSymbol } from ".";

export class AppErrorEvent implements ISlackMessage {
    [SlackMessageSymbol] = true as const;

    constructor(private readonly error?: Error) {}

    render() {
        if (this.error) {
            return {
                text: "App caught error",
                attachments: [
                    {
                        title: "Type",
                        text: this.error.constructor.name,
                    },
                    {
                        title: "Name",
                        text: this.error.name,
                    },
                    {
                        title: "Message",
                        text: this.error.message,
                    },
                    {
                        title: "Stack",
                        text: this.error.stack,
                    },
                ],
            };
        }
    }
}
