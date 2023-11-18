import {
    type ChatPostMessageArguments,
    ChatPostMessageResponse,
} from "@slack/web-api";
import { ISlackMessageSender, resolveSlackMessage } from ".";
import { SlackChannel } from "./channel";
import { ISlackMessage } from "./messages";

export class SlackBot implements ISlackMessageSender {
    constructor(
        private readonly username: string,
        private readonly channel: SlackChannel,
    ) {}

    sendMessage(
        message: ISlackMessage | Partial<ChatPostMessageArguments>,
    ): Promise<ChatPostMessageResponse> {
        return this.channel.sendMessage({
            username: this.username,
            ...resolveSlackMessage(message),
        });
    }
}
