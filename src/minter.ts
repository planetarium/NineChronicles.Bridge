import { Account, Address } from "@planetarium/account";
import { encodeCurrency, encodeSignedTx, signTx } from "@planetarium/tx";
import { IFungibleAssetValues, IFungibleItems, IMinter } from "./interfaces/minter";
import { HeadlessGraphQLClient } from "./headless-graphql-client";
import { RecordView, Value, encode } from "@planetarium/bencodex";
import { additionalGasTxProperties } from "./tx";


export class Minter implements IMinter {
    private readonly _account: Account;
    private readonly _client: HeadlessGraphQLClient;
    
    constructor(account: Account, client: HeadlessGraphQLClient) {
        this._account = account;
        this._client = client;
    }
    
    async mintAssets(assets: [IFungibleAssetValues | IFungibleItems]): Promise<string> {
        const action = new RecordView(            
            {
                type_id: "mint_assets",
                values: assets.map(encodeMintSpec),
            },
            "text"
        );

        return await this.sendTx(action);
    }
    
    getMinterAddress(): Promise<Address> {
        return this._account.getAddress();
    }

    private async sendTx(action: RecordView): Promise<string> {
        const minter = await this.getMinterAddress();
        const nonce = BigInt(await this._client.getNextTxNonce(minter.toHex()));
        const genesisHash = Buffer.from(
            await this._client.getGenesisHash(),
            "hex"
        );
        
        const unsignedTx = {
            nonce,
            genesisHash,
            publicKey: (await this._account.getPublicKey()).toBytes("uncompressed"),
            signer: minter.toBytes(),
            timestamp: new Date(),
            updatedAddresses: new Set([]),
            actions: [action],
            ...additionalGasTxProperties,
        };
        
        const tx = await signTx(unsignedTx, this._account);
        return this._client.stageTransaction(Buffer.from(encode(encodeSignedTx(tx))).toString("hex"));
    }
}

function encodeMintSpec(value: IFungibleAssetValues | IFungibleItems): Value {
    if ((value as IFungibleAssetValues).amount !== undefined) {
        const favs = value as IFungibleAssetValues;
        return [
            Address.fromHex(favs.recipient, true).toBytes(),
            [
                encodeCurrency(favs.amount.currency),
                favs.amount.rawValue,
            ],
            null
        ];
    } else {
        const fis = value as IFungibleItems;
        return [
            Address.fromHex(fis.recipient, true).toBytes(),
            null,
            [Buffer.from(fis.fungibleItemId, "hex"), BigInt(fis.count)],
        ]
    }
}
