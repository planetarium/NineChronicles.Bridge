import { FungibleAssetValue } from "@planetarium/tx";
import { IObserver } from ".";
import { IMinter } from "../interfaces/minter";
import { ISlackMessageSender } from "../slack";
import { SlackBot } from "../slack/bot";
import { AppErrorEvent } from "../slack/messages/app-error-event";
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
    private readonly _slackbot: ISlackMessageSender;
    constructor(slackbot: ISlackMessageSender, minter: IMinter) {
        this._slackbot = slackbot;

        this._minter = minter;
    }

    async notify(data: {
        blockHash: BlockHash;
        events: (AssetTransferredEvent & TransactionLocation)[];
    }): Promise<void> {
        const { events } = data;

        for (const {
            sender,
            blockHash,
            planetID,
            txId,
            amount,
            memo: recipient,
        } of events) {
            // TODO check memo & refund if needed.

            try {
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
                await this._slackbot.sendMessage(
                    new BridgeEvent(
                        "MINT",
                        [planetID, txId],
                        [this._minter.getMinterPlanet(), resTxId],
                        sender.toString(),
                        recipient.toString(),
                    ),
                );
            } catch (e) {
                console.error(e);
                await this._slackbot.sendMessage(new AppErrorEvent(e));
            }
        }
    }
}
