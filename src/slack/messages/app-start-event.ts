import { Address } from "@planetarium/account";
import { ISlackMessage, SlackMessageSymbol } from ".";

export class AppStartEvent implements ISlackMessage {
    [SlackMessageSymbol] = true as const;

    constructor(
        private readonly upstreamAccountAddress: Address,
        private readonly downstreamAccountAddress: Address,
    ) {}

    render() {
        const upstreamAccountAddressString =
            this.upstreamAccountAddress.toString();
        const downstreamAccountAddressString =
            this.downstreamAccountAddress.toString();

        return {
            text: "App Started",
            attachments: [
                {
                    title: "Upstream account address",
                    text: upstreamAccountAddressString,
                },
                {
                    title: "Downstream account address",
                    text: downstreamAccountAddressString,
                },
            ],
            fallback: `App Started(${upstreamAccountAddressString}/${downstreamAccountAddressString})`,
        };
    }
}
