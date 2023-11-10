import test from 'node:test'
import { GarageObserver } from './garage-observer'
import { Sqlite3MonitorStateStore } from '../sqlite3-monitor-state-store'
import { RawPrivateKey } from '@planetarium/account'
import { Minter } from '../minter'
import { HeadlessGraphQLClient } from '../headless-graphql-client'

void test('notify', async () => {
  const monitorStateStore = await Sqlite3MonitorStateStore.open('test')
  const account = RawPrivateKey.fromHex('')
  const minter = new Minter(
    account,
    new HeadlessGraphQLClient('https://heimdall-internal-rpc-1.nine-chronicles.com/graphql', 1)
  )
  const observer = new GarageObserver(monitorStateStore, minter)
  void observer.notify({
    blockHash: 'xxx',
    events: [{
      blockHash: 'xxx',
      fungibleAssetValues: [
        [
          await account.getAddress(),
          {
            currency: {
              ticker: 'CRYSTAL',
              decimalPlaces: 18,
              minters: null,
              totalSupplyTrackable: false,
              maximumSupply: null
            },
            rawValue: 10n
          }
        ]
      ],
      fungibleItems: [
        [
          await account.getAddress(),
          '1a755098a2bc0659a063107df62e2ff9b3cdaba34d96b79519f504b996f53820',
          100
        ]
      ],
      txId: '',
      memo: JSON.stringify([
        '0x019101FEec7ed4f918D396827E1277DEda1e20D4',
        '0x37fd092455B529cFAE3Bf3b58201cE029231cDBe'
      ])
    }]
  })
})
