import { FungibleAssetValue, encodeCurrency, encodeSignedTx, signTx } from '@planetarium/tx'
import { IHeadlessGraphQLClient } from './interfaces/headless-graphql-client'
import { Account } from '@planetarium/account'
import { RecordView, encode } from '@planetarium/bencodex'
import { additionalGasTxProperties } from './tx'
import { IAssetBurner } from './interfaces/asset-burner'

export class AssetBurner implements IAssetBurner {
  private readonly _client: IHeadlessGraphQLClient
  private readonly _account: Account

  constructor (account: Account, client: IHeadlessGraphQLClient) {
    this._account = account
    this._client = client
  }

  async burn (amount: FungibleAssetValue, memo: string): Promise<string> {
    const sender = (await this._account.getAddress()).toBytes()
    const action = new RecordView(
      {
        type_id: 'burn_asset',
        values: [
          sender,
          [
            encodeCurrency(amount.currency),
            amount.rawValue
          ],
          memo
        ]
      },
      'text'
    )

    return await this.sendTx(action)
  }

  private async sendTx (action: RecordView): Promise<string> {
    const address = await this._account.getAddress()
    const nonce = BigInt(await this._client.getNextTxNonce(address.toHex()))
    const genesisHash = Buffer.from(
      await this._client.getGenesisHash(),
      'hex'
    )

    const unsignedTx = {
      nonce,
      genesisHash,
      publicKey: (await this._account.getPublicKey()).toBytes('uncompressed'),
      signer: address.toBytes(),
      timestamp: new Date(),
      updatedAddresses: new Set([]),
      actions: [action],
      ...additionalGasTxProperties
    }

    const tx = await signTx(unsignedTx, this._account)
    return await this._client.stageTransaction(Buffer.from(encode(encodeSignedTx(tx))).toString('hex'))
  }
}
