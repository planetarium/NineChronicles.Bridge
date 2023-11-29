import { Address } from "@planetarium/account";
import { IObserver } from ".";
import {
    IFungibleAssetValues,
    IFungibleItems,
    IMinter,
} from "../interfaces/minter";
import { ValidatedGarageUnloadEvent } from "../monitors/garage-unload-monitor";
import { ISlackMessageSender } from "../slack";
import { SlackBot } from "../slack/bot";
import { BridgeErrorEvent } from "../slack/messages/bridge-error-event";
import { BridgeEvent } from "../slack/messages/bridge-event";
import { BlockHash } from "../types/block-hash";
import { GarageUnloadEvent } from "../types/garage-unload-event";
import { TransactionLocation } from "../types/transaction-location";

export class GarageObserver
    implements
        IObserver<{
            blockHash: BlockHash;
            events: (ValidatedGarageUnloadEvent & TransactionLocation)[];
        }>
{
    private readonly _slackbot: ISlackMessageSender;
    private readonly _minter: IMinter;
    private readonly _vaultAddresses: {
        agentAddress: Address;
        avatarAddress: Address;
    };

    constructor(
        slackbot: ISlackMessageSender,
        minter: IMinter,
        vaultAddresses: {
            agentAddress: Address;
            avatarAddress: Address;
        },
    ) {
        this._slackbot = slackbot;
        this._minter = minter;
        this._vaultAddresses = vaultAddresses;
    }

    async notify(data: {
        blockHash: BlockHash;
        events: (ValidatedGarageUnloadEvent & TransactionLocation)[];
    }): Promise<void> {
        const { events } = data;

        for (const {
            signer,
            blockHash,
            txId,
            planetID,
            fungibleAssetValues,
            fungibleItems,
            parsedMemo: { agentAddress, avatarAddress, memo: memoForMinter },
        } of events) {
            try {
                const requests: (IFungibleAssetValues | IFungibleItems)[] = [];
                for (const fa of fungibleAssetValues) {
                    if (fa[0].equals(this._vaultAddresses.agentAddress)) {
                        requests.push({
                            recipient: agentAddress,
                            amount: fa[1],
                        });
                    } else if (
                        fa[0].equals(this._vaultAddresses.avatarAddress)
                    ) {
                        requests.push({
                            recipient: avatarAddress,
                            amount: fa[1],
                        });
                    }
                }

                for (const fi of fungibleItems) {
                    requests.push({
                        recipient: avatarAddress,
                        fungibleItemId: fi[1],
                        count: fi[2],
                    });
                }

                if (requests.length !== 0) {
                    const resTxId = await this._minter.mintAssets(
                        // @ts-ignore
                        requests,
                        memoForMinter,
                    );
                    await this._slackbot.sendMessage(
                        new BridgeEvent(
                            "MINT",
                            [planetID, txId],
                            [this._minter.getMinterPlanet(), resTxId],
                            signer,
                            requests.map((x) => x.recipient).join(", "),
                        ),
                    );
                }
            } catch (e) {
                console.error(e);
                await this._slackbot.sendMessage(
                    new BridgeErrorEvent([planetID, txId], e),
                );
            }
        }
    }
}
