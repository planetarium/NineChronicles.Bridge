import { ISlackMessage, SlackMessageSymbol } from ".";

export class AppStopEvent implements ISlackMessage {
    [SlackMessageSymbol] = true as const;

    render() {
        return {
            text: "App Stopped",
            fallback: "App Stopped",
        };
    }
}
