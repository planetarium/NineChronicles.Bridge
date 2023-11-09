import { FungibleAssetValue, encodeCurrency, encodeSignedTx, signTx } from "@planetarium/tx";
import { IAssetTransfer } from "./interfaces/asset-transfer";
import { IHeadlessGraphQLClient } from "./interfaces/headless-graphql-client";
import { Account, Address } from "@planetarium/account";
import { RecordView, encode } from "@planetarium/bencodex";
import { additionalGasTxProperties } from "./tx";

export class AssetTransfer implements IAssetTransfer {
    private readonly _client:  IHeadlessGraphQLClient;
    private readonly _account: Account;

    constructor(account: Account, client: IHeadlessGraphQLClient) {
        this._account = account;
        this._client = client;
    }

    async transfer(recipient: Address, amount: FungibleAssetValue, memo: string): Promise<string> {
        const sender = (await this._account.getAddress()).toBytes();
        const action = new RecordView(
            {
                type_id: "transfer_asset5",
                values: {
                    // `encodeFungibleAssetValue()` wasn't exported properly.
                    amount: [encodeCurrency(amount.currency), amount.rawValue],
                    ...(memo === null ? {} : { memo }),
                    recipient: Buffer.from(recipient.toBytes()),
                    sender: Buffer.from(sender),
                },
            },
            "text"
        );

        return await this.sendTx(action);
    }
    
    private async sendTx(action: RecordView): Promise<string> {
        const address = await this._account.getAddress();
        const nonce = BigInt(await this._client.getNextTxNonce(address.toHex()));
        const genesisHash = Buffer.from(
            await this._client.getGenesisHash(),
            "hex"
        );
        
        const unsignedTx = {
            nonce,
            genesisHash,
            publicKey: (await this._account.getPublicKey()).toBytes("uncompressed"),
            signer: address.toBytes(),
            timestamp: new Date(),
            updatedAddresses: new Set([]),
            actions: [action],
            ...additionalGasTxProperties,
        };
        
        const tx = await signTx(unsignedTx, this._account);
        return this._client.stageTransaction(Buffer.from(encode(encodeSignedTx(tx))).toString("hex"));
    }
}