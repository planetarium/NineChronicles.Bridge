import { FungibleAssetValue } from '@planetarium/tx'

export interface IAssetBurner {
  burn: (amount: FungibleAssetValue, memo: string) => Promise<string>
}
