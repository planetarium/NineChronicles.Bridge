import {
    ChatPostMessageArguments,
    type ChatPostMessageResponse,
    WebClient,
} from "@slack/web-api";
import { ISlackMessageSender, resolveSlackMessage } from ".";
import { type ISlackMessage } from "./messages";

export class SlackChannel implements ISlackMessageSender {
    constructor(
        private readonly channel: string,
        private readonly webClient: WebClient,
    ) {}

    async sendMessage(
        message: ISlackMessage | Partial<ChatPostMessageArguments>,
    ): Promise<ChatPostMessageResponse> {
        return this.webClient.chat.postMessage({
            channel: this.channel,
            ...resolveSlackMessage(message),
        });
    }
}
