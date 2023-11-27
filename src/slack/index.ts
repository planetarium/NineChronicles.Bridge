import {
    type ChatPostMessageArguments,
    type ChatPostMessageResponse,
} from "@slack/web-api";
import { ISlackMessage, isSlackMessage } from "./messages";

export interface ISlackMessageSender {
    sendMessage(
        message: ISlackMessage | Partial<ChatPostMessageArguments>,
    ): Promise<ChatPostMessageResponse>;
}

export function resolveSlackMessage(
    message: ISlackMessage | Partial<ChatPostMessageArguments>,
) {
    if (isSlackMessage(message)) {
        return message.render();
    }

    return message;
}
