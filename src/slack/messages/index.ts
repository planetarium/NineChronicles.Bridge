import { type ChatPostMessageArguments } from "@slack/web-api";

export type ForceOmit<T, K extends keyof T> = Omit<T, K> &
    Partial<Record<K, never>>;

export const SlackMessageSymbol = Symbol("ISlackMessage");

export interface ISlackMessage {
    render(): ForceOmit<ChatPostMessageArguments, "channel">;
    [SlackMessageSymbol]: true;
}

export function isSlackMessage(x: unknown): x is ISlackMessage {
    return Object.getOwnPropertyDescriptor(x, SlackMessageSymbol) !== undefined;
}
