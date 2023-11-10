import { Address } from '@planetarium/account'
import { IHeadlessGraphQLClient } from '../interfaces/headless-graphql-client'
import { TransactionLocation } from '../types/transaction-location'
import { NineChroniclesMonitor } from './ninechronicles-block-monitor'
import { AssetTransferredEvent } from '../types/asset-transferred-event'

export class AssetsTransferredMonitor extends NineChroniclesMonitor<AssetTransferredEvent> {
  private readonly _address: Address

  constructor (
    latestTransactionLocation: TransactionLocation | null,
    headlessGraphQLClient: IHeadlessGraphQLClient,
    address: Address
  ) {
    super(latestTransactionLocation, headlessGraphQLClient)
    this._address = address
  }

  protected async getEvents (
    blockIndex: number
  ): Promise<Array<AssetTransferredEvent & TransactionLocation>> {
    const blockHash = await this._headlessGraphQLClient.getBlockHash(
      blockIndex
    )
    return (await this._headlessGraphQLClient.getAssetTransferredEvents(
      blockIndex,
      this._address
    )).map(ev => { return { blockHash, ...ev } })
  }
}
