import { FungibleAssetValue } from "@planetarium/tx";

export interface IAssetBurner {
    getBurnerPlanet(): string;
    burn(amount: FungibleAssetValue, memo: string): Promise<string>;
}
