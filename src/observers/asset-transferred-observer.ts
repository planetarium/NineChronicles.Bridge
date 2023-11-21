import { FungibleAssetValue } from "@planetarium/tx";
import { IObserver } from ".";
import { IMinter } from "../interfaces/minter";
import { SlackBot } from "../slack/bot";
import { BridgeEvent } from "../slack/messages/bridge-event";
import { AssetTransferredEvent } from "../types/asset-transferred-event";
import { BlockHash } from "../types/block-hash";
import { TransactionLocation } from "../types/transaction-location";

export class AssetTransferredObserver
    implements
        IObserver<{
            blockHash: BlockHash;
            planetID: string;
            events: (AssetTransferredEvent & TransactionLocation)[];
        }>
{
    private readonly _minter: IMinter;
    private readonly _slackbot: SlackBot;
    constructor(slackbot: SlackBot, minter: IMinter) {
        this._slackbot = slackbot;

        this._minter = minter;
    }

    async notify(data: {
        blockHash: BlockHash;
        events: (AssetTransferredEvent & TransactionLocation)[];
    }): Promise<void> {
        const { events } = data;

        for (const {
            blockHash,
            planetID,
            txId,
            amount,
            memo: recipient,
        } of events) {
            // TODO check memo & refund if needed.

            // Strip minters to mint well.
            const amountToMint: FungibleAssetValue = {
                currency: {
                    ...amount.currency,
                    minters: null,
                },
                rawValue: amount.rawValue,
            };

            const resTxId = await this._minter.mintAssets(
                [{ recipient, amount: amountToMint }],
                null,
            );
            this._slackbot.sendMessage(
                new BridgeEvent(
                    "MINT",
                    [planetID, txId],
                    [this._minter.getMinterPlanet(), resTxId],
                ),
            );
        }
    }
}
