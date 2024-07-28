import { Account, Address } from "@planetarium/account";
import { Value } from "@planetarium/bencodex";
import { FungibleAssetValue, signTx } from "@planetarium/tx";
import { ResponseType } from "@prisma/client";
import { encodeBurnAssetAction } from "../../../actions/burn";
import { encodeMintAssetsAction } from "../../../actions/mint";
import { encodeTransferAssetAction } from "../../../actions/transfer";
import { SUPER_FUTURE_DATETIME, additionalGasTxProperties } from "../../../tx";
import { AssetTransferredEvent } from "../../../types/asset-transferred-event";
import { SignedTx } from "../../../types/signed-tx";
import { BridgeResponse } from "../../types";
import { ValidatedAssetTransferredEvent } from "../../../events/assets-transferred";

export async function responseTransactionsFromTransferEvents(
    events: ValidatedAssetTransferredEvent[],
    {
        account: upstreamAccount,
        networkId: upstreamNetworkId,
        genesisHash: upstreamGenesisHash,
        startNonce: upstreamStartNonce,
        ncgMinter: upstreamNcgMinter,
    }: {
        account: Account;
        networkId: string;
        genesisHash: Uint8Array;
        startNonce: bigint;
        ncgMinter: Address;
    },
    {
        account: downstreamAccount,
        networkId: downstreamNetworkId,
        genesisHash: downstreamGenesisHash,
        startNonce: downstreamStartNonce,
    }: {
        account: Account;
        networkId: string;
        genesisHash: Uint8Array;
        startNonce: bigint;
    },
): Promise<BridgeResponse[]> {
    const upstreamSignerAddress = await upstreamAccount.getAddress();
    const downstreamSignerAddress = await downstreamAccount.getAddress();
    const responses: BridgeResponse[] = [];
    let upstreamNonce = upstreamStartNonce;
    let downstreamNonce = downstreamStartNonce;

    for (const { txId, amount, targetAddress: recipient } of events) {
        const burnAssetAction = encodeBurnAssetAction(
            downstreamSignerAddress,
            amount,
            txId,
        );

        const transferAssetAmount =
            amount.currency.ticker === "NCG"
                ? {
                      currency: {
                          ...amount.currency,
                          minters: new Set([upstreamNcgMinter.toBytes()]),
                      },
                      rawValue: amount.rawValue,
                  }
                : amount;
        const transferAssetAction = encodeTransferAssetAction(
            recipient,
            upstreamSignerAddress,
            transferAssetAmount,
            null,
        );

        const downstreamSignedTx = await bulidAndSign(
            downstreamAccount,
            downstreamNonce,
            downstreamGenesisHash,
            burnAssetAction,
        );
        const upstreamSignedTx = await bulidAndSign(
            upstreamAccount,
            upstreamNonce,
            upstreamGenesisHash,
            transferAssetAction,
        );

        responses.push({
            signedTx: upstreamSignedTx,
            networkId: upstreamNetworkId,
            type: ResponseType.TRANSFER_ASSET,
            requestTxId: txId,
        });
        responses.push({
            signedTx: downstreamSignedTx,
            networkId: downstreamNetworkId,
            type: ResponseType.BURN_ASSET,
            requestTxId: txId,
        });

        upstreamNonce += 1n;
        downstreamNonce += 1n;
    }

    return responses;
}

async function bulidAndSign(
    account: Account,
    nonce: bigint,
    genesisHash: Uint8Array,
    action: Value,
): Promise<SignedTx> {
    const unsignedTx = {
        nonce,
        genesisHash,
        publicKey: (await account.getPublicKey()).toBytes("uncompressed"),
        signer: (await account.getAddress()).toBytes(),
        timestamp: SUPER_FUTURE_DATETIME,
        updatedAddresses: new Set([]),
        actions: [action],
        ...additionalGasTxProperties,
    };

    return await signTx(unsignedTx, account);
}
