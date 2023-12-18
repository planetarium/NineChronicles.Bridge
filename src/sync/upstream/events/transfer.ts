import { Account } from "@planetarium/account";
import { FungibleAssetValue, signTx } from "@planetarium/tx";
import { ResponseType } from "@prisma/client";
import { encodeMintAssetsAction } from "../../../actions/mint";
import { SUPER_FUTURE_DATETIME, additionalGasTxProperties } from "../../../tx";
import { AssetTransferredEvent } from "../../../types/asset-transferred-event";
import { BridgeResponse } from "../../types";

export async function responseTransactionsFromTransferEvents(
    events: AssetTransferredEvent[],
    account: Account,
    networkId: string,
    genesisHash: Uint8Array,
    startNonce: bigint,
): Promise<BridgeResponse[]> {
    const signerAddress = await account.getAddress();
    const responses: BridgeResponse[] = [];
    let nonce = startNonce;

    for (const { txId, amount, memo: recipient } of events) {
        const amountToMint: FungibleAssetValue = {
            currency: {
                ...amount.currency,
                minters: null,
            },
            rawValue: amount.rawValue,
        };

        const action = encodeMintAssetsAction(
            [{ recipient, amount: amountToMint }],
            null,
        );

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
