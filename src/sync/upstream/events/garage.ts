import { Account, Address } from "@planetarium/account";
import { signTx } from "@planetarium/tx";
import { ResponseType } from "@prisma/client";
import { ValidatedGarageUnloadEvent } from "../../../events/garage-unload";
import {
    IFungibleAssetValues,
    IFungibleItems,
} from "../../../interfaces/minter";
import { encodeMintAssetsAction } from "../../../minter";
import { SUPER_FUTURE_DATETIME, additionalGasTxProperties } from "../../../tx";
import { BridgeResponse } from "../../types";

export async function responseTransactionsFromGarageEvents(
    events: ValidatedGarageUnloadEvent[],
    account: Account,
    networkId: string,
    genesisHash: Uint8Array,
    startNonce: bigint,
    vaultAddresses: {
        agentAddress: Address;
        avatarAddress: Address;
    },
): Promise<BridgeResponse[]> {
    const signerAddress = await account.getAddress();
    const responses: BridgeResponse[] = [];
    let nonce = startNonce;
    for (const {
        txId,
        fungibleAssetValues,
        fungibleItems,
        parsedMemo: { agentAddress, avatarAddress, memo: memoForMinter },
    } of events) {
        const requests: (IFungibleAssetValues | IFungibleItems)[] = [];
        for (const fa of fungibleAssetValues) {
            if (fa[0].equals(vaultAddresses.agentAddress)) {
                requests.push({
                    recipient: agentAddress,
                    amount: fa[1],
                });
            } else if (fa[0].equals(vaultAddresses.avatarAddress)) {
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

        const action = encodeMintAssetsAction(requests, memoForMinter);

        const unsignedTx = {
            nonce,
            genesisHash,
            publicKey: (await account.getPublicKey()).toBytes("uncompressed"),
            signer: signerAddress.toBytes(),
            timestamp: SUPER_FUTURE_DATETIME,
            updatedAddresses: new Set([]),
            actions: [action],
            ...additionalGasTxProperties,
        };

        const signedTx = await signTx(unsignedTx, account);
        responses.push({
            signedTx,
            networkId,
            type: ResponseType.MINT_ASSETS,
            requestTxId: txId,
        });

        nonce += 1n;
    }

    return responses;
}
