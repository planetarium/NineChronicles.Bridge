import { IObserver } from '.'
import { IFungibleAssetValues, IFungibleItems, IMinter } from '../interfaces/minter'
import { IMonitorStateStore } from '../interfaces/monitor-state-store'
import { BlockHash } from '../types/block-hash'
import { GarageUnloadEvent } from '../types/garage-unload-event'
import { TransactionLocation } from '../types/transaction-location'

export class GarageObserver implements IObserver<{
  blockHash: BlockHash
  events: Array<GarageUnloadEvent & TransactionLocation>
}> {
  private readonly _minter: IMinter
  private readonly _monitorStateStore: IMonitorStateStore

  constructor (monitorStateStore: IMonitorStateStore, minter: IMinter) {
    this._minter = minter
    this._monitorStateStore = monitorStateStore
  }

  async notify (data: { blockHash: BlockHash, events: Array<GarageUnloadEvent & TransactionLocation> }): Promise<void> {
    const { events } = data

    for (const { blockHash, txId, fungibleAssetValues, fungibleItems, memo } of events) {
      await this._monitorStateStore.store('nine-chronicles', {
        blockHash,
        txId
      })

      const { agentAddress, avatarAddress } = parseMemo(memo)

      const requests: Array<IFungibleAssetValues | IFungibleItems> = []
      for (const fa of fungibleAssetValues) {
        requests.push({
          recipient: agentAddress,
          amount: fa[1]
        })
      }

      for (const fi of fungibleItems) {
        requests.push({
          recipient: avatarAddress,
          fungibleItemId: fi[1],
          count: fi[2]
        })
      }

      if (requests.length !== 0) {
        // @ts-expect-error
        await this._minter.mintAssets(requests)
      }
    }
  }
}
function parseMemo (memo: string): { agentAddress: string, avatarAddress: string } {
  const parsed = JSON.parse(memo)

  return {
    agentAddress: parsed[0],
    avatarAddress: parsed[1]
  }
}
