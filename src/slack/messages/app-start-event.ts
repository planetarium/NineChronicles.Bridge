import { ISlackMessage, SlackMessageSymbol } from ".";

export class AppStartEvent implements ISlackMessage {
    [SlackMessageSymbol] = true as const;

    render() {
        return {
            text: "App Started",
        };
    }
}
