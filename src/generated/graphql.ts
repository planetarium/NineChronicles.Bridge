/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Address: { input: string; output: string; }
  BencodexValue: { input: any; output: any; }
  BigInt: { input: string; output: string; }
  Byte: { input: any; output: any; }
  ByteString: { input: any; output: any; }
  DateTimeOffset: { input: any; output: any; }
  Decimal: { input: any; output: any; }
  Guid: { input: string; output: string; }
  HashDigest_SHA256: { input: any; output: any; }
  Long: { input: number; output: number; }
  PublicKey: { input: any; output: any; }
  TxId: { input: any; output: any; }
  VoteFlag: { input: any; output: any; }
};

export type Action = {
  __typename?: 'Action';
  inspection: Scalars['String']['output'];
  json: Scalars['String']['output'];
  raw: Scalars['String']['output'];
};


export type ActionRawArgs = {
  encode?: InputMaybe<Scalars['String']['input']>;
};

export type ActionMutation = {
  __typename?: 'ActionMutation';
  chargeActionPoint: Scalars['TxId']['output'];
  claimMonsterCollectionReward: Scalars['TxId']['output'];
  combinationConsumable: Scalars['TxId']['output'];
  combinationEquipment: Scalars['TxId']['output'];
  createAvatar: Scalars['TxId']['output'];
  dailyReward: Scalars['TxId']['output'];
  hackAndSlash: Scalars['TxId']['output'];
  itemEnhancement: Scalars['TxId']['output'];
  monsterCollect: Scalars['TxId']['output'];
};


export type ActionMutationChargeActionPointArgs = {
  avatarAddress: Scalars['Address']['input'];
};


export type ActionMutationClaimMonsterCollectionRewardArgs = {
  avatarAddress: Scalars['Address']['input'];
};


export type ActionMutationCombinationConsumableArgs = {
  avatarAddress: Scalars['Address']['input'];
  recipeId: Scalars['Int']['input'];
  slotIndex: Scalars['Int']['input'];
};


export type ActionMutationCombinationEquipmentArgs = {
  avatarAddress: Scalars['Address']['input'];
  recipeId: Scalars['Int']['input'];
  slotIndex: Scalars['Int']['input'];
  subRecipeId?: InputMaybe<Scalars['Int']['input']>;
};


export type ActionMutationCreateAvatarArgs = {
  avatarIndex: Scalars['Int']['input'];
  avatarName: Scalars['String']['input'];
  earIndex: Scalars['Int']['input'];
  hairIndex: Scalars['Int']['input'];
  lensIndex: Scalars['Int']['input'];
  tailIndex: Scalars['Int']['input'];
};


export type ActionMutationDailyRewardArgs = {
  avatarAddress: Scalars['Address']['input'];
};


export type ActionMutationHackAndSlashArgs = {
  avatarAddress: Scalars['Address']['input'];
  consumableIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  costumeIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  equipmentIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  runeSlotInfos?: InputMaybe<Array<RuneSlotInfoInputType>>;
  stageId: Scalars['Int']['input'];
  worldId: Scalars['Int']['input'];
};


export type ActionMutationItemEnhancementArgs = {
  avatarAddress: Scalars['Address']['input'];
  itemId: Scalars['Guid']['input'];
  materialIds: Array<Scalars['Guid']['input']>;
  slotIndex: Scalars['Int']['input'];
};


export type ActionMutationMonsterCollectArgs = {
  level: Scalars['Int']['input'];
};

export type ActionQuery = {
  __typename?: 'ActionQuery';
  /** @deprecated Since NCIP-15, it doesn't care account activation. */
  activateAccount: Scalars['ByteString']['output'];
  approvePledge: Scalars['ByteString']['output'];
  auraSummon: Scalars['ByteString']['output'];
  claimItems: Scalars['ByteString']['output'];
  claimRaidReward: Scalars['ByteString']['output'];
  claimStakeReward?: Maybe<Scalars['ByteString']['output']>;
  claimWorldBossKillReward: Scalars['ByteString']['output'];
  combinationConsumable: Scalars['ByteString']['output'];
  combinationEquipment: Scalars['ByteString']['output'];
  craftQuery: CraftQuery;
  createAvatar: Scalars['ByteString']['output'];
  createPledge: Scalars['ByteString']['output'];
  dailyReward: Scalars['ByteString']['output'];
  deliverToOthersGarages: Scalars['ByteString']['output'];
  endPledge: Scalars['ByteString']['output'];
  grinding?: Maybe<Scalars['ByteString']['output']>;
  hackAndSlash: Scalars['ByteString']['output'];
  hackAndSlashSweep: Scalars['ByteString']['output'];
  itemEnhancement: Scalars['ByteString']['output'];
  loadIntoMyGarages: Scalars['ByteString']['output'];
  migrateMonsterCollection: Scalars['ByteString']['output'];
  patchTableSheet: Scalars['ByteString']['output'];
  prepareRewardAssets: Scalars['ByteString']['output'];
  raid: Scalars['ByteString']['output'];
  rapidCombination: Scalars['ByteString']['output'];
  requestPledge: Scalars['ByteString']['output'];
  runeEnhancement: Scalars['ByteString']['output'];
  stake?: Maybe<Scalars['ByteString']['output']>;
  transferAsset?: Maybe<Scalars['ByteString']['output']>;
  transferAssets: Scalars['ByteString']['output'];
  unloadFromMyGarages: Scalars['ByteString']['output'];
  unlockEquipmentRecipe?: Maybe<Scalars['ByteString']['output']>;
  unlockWorld?: Maybe<Scalars['ByteString']['output']>;
};


export type ActionQueryActivateAccountArgs = {
  activationCode: Scalars['String']['input'];
};


export type ActionQueryApprovePledgeArgs = {
  patronAddress: Scalars['Address']['input'];
};


export type ActionQueryAuraSummonArgs = {
  avatarAddress: Scalars['Address']['input'];
  groupId: Scalars['Int']['input'];
  summonCount: Scalars['Int']['input'];
};


export type ActionQueryClaimItemsArgs = {
  claimData: Array<ClaimDataInputType>;
};


export type ActionQueryClaimRaidRewardArgs = {
  avatarAddress: Scalars['Address']['input'];
};


export type ActionQueryClaimStakeRewardArgs = {
  avatarAddress?: InputMaybe<Scalars['Address']['input']>;
};


export type ActionQueryClaimWorldBossKillRewardArgs = {
  avatarAddress: Scalars['Address']['input'];
};


export type ActionQueryCombinationConsumableArgs = {
  avatarAddress: Scalars['Address']['input'];
  recipeId: Scalars['Int']['input'];
  slotIndex: Scalars['Int']['input'];
};


export type ActionQueryCombinationEquipmentArgs = {
  avatarAddress: Scalars['Address']['input'];
  payByCrystal?: InputMaybe<Scalars['Boolean']['input']>;
  recipeId: Scalars['Int']['input'];
  slotIndex: Scalars['Int']['input'];
  subRecipeId?: InputMaybe<Scalars['Int']['input']>;
  useHammerPoint?: InputMaybe<Scalars['Boolean']['input']>;
};


export type ActionQueryCreateAvatarArgs = {
  ear?: InputMaybe<Scalars['Int']['input']>;
  hair?: InputMaybe<Scalars['Int']['input']>;
  index: Scalars['Int']['input'];
  lens?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  tail?: InputMaybe<Scalars['Int']['input']>;
};


export type ActionQueryCreatePledgeArgs = {
  agentAddresses: Array<Scalars['Address']['input']>;
  mead?: InputMaybe<Scalars['Int']['input']>;
  patronAddress: Scalars['Address']['input'];
};


export type ActionQueryDailyRewardArgs = {
  avatarAddress: Scalars['Address']['input'];
};


export type ActionQueryDeliverToOthersGaragesArgs = {
  fungibleAssetValues?: InputMaybe<Array<SimplifyFungibleAssetValueInput>>;
  fungibleIdAndCounts?: InputMaybe<Array<FungibleIdAndCountInput>>;
  memo?: InputMaybe<Scalars['String']['input']>;
  recipientAgentAddr: Scalars['Address']['input'];
};


export type ActionQueryEndPledgeArgs = {
  agentAddress: Scalars['Address']['input'];
};


export type ActionQueryGrindingArgs = {
  avatarAddress: Scalars['Address']['input'];
  chargeAp?: InputMaybe<Scalars['Boolean']['input']>;
  equipmentIds: Array<InputMaybe<Scalars['Guid']['input']>>;
};


export type ActionQueryHackAndSlashArgs = {
  avatarAddress: Scalars['Address']['input'];
  consumableIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  costumeIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  equipmentIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  runeSlotInfos?: InputMaybe<Array<RuneSlotInfoInputType>>;
  stageBuffId?: InputMaybe<Scalars['Int']['input']>;
  stageId: Scalars['Int']['input'];
  worldId: Scalars['Int']['input'];
};


export type ActionQueryHackAndSlashSweepArgs = {
  actionPoint: Scalars['Int']['input'];
  apStoneCount?: InputMaybe<Scalars['Int']['input']>;
  avatarAddress: Scalars['Address']['input'];
  costumeIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  equipmentIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  runeSlotInfos?: InputMaybe<Array<RuneSlotInfoInputType>>;
  stageId: Scalars['Int']['input'];
  worldId: Scalars['Int']['input'];
};


export type ActionQueryItemEnhancementArgs = {
  avatarAddress: Scalars['Address']['input'];
  itemId: Scalars['Guid']['input'];
  materialIds: Array<Scalars['Guid']['input']>;
  slotIndex: Scalars['Int']['input'];
};


export type ActionQueryLoadIntoMyGaragesArgs = {
  fungibleAssetValues?: InputMaybe<Array<BalanceInput>>;
  fungibleIdAndCounts?: InputMaybe<Array<FungibleIdAndCountInput>>;
  inventoryAddr?: InputMaybe<Scalars['Address']['input']>;
  memo?: InputMaybe<Scalars['String']['input']>;
};


export type ActionQueryMigrateMonsterCollectionArgs = {
  avatarAddress?: InputMaybe<Scalars['Address']['input']>;
};


export type ActionQueryPatchTableSheetArgs = {
  tableCsv: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
};


export type ActionQueryPrepareRewardAssetsArgs = {
  assets: Array<FungibleAssetValueInputType>;
  rewardPoolAddress: Scalars['Address']['input'];
};


export type ActionQueryRaidArgs = {
  avatarAddress: Scalars['Address']['input'];
  costumeIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  equipmentIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  foodIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  payNcg?: InputMaybe<Scalars['Boolean']['input']>;
  runeSlotInfos?: InputMaybe<Array<RuneSlotInfoInputType>>;
};


export type ActionQueryRapidCombinationArgs = {
  avatarAddress: Scalars['Address']['input'];
  slotIndex: Scalars['Int']['input'];
};


export type ActionQueryRequestPledgeArgs = {
  agentAddress: Scalars['Address']['input'];
  mead?: InputMaybe<Scalars['Int']['input']>;
};


export type ActionQueryRuneEnhancementArgs = {
  avatarAddress: Scalars['Address']['input'];
  runeId: Scalars['Int']['input'];
  tryCount?: InputMaybe<Scalars['Int']['input']>;
};


export type ActionQueryStakeArgs = {
  amount?: InputMaybe<Scalars['BigInt']['input']>;
};


export type ActionQueryTransferAssetArgs = {
  amount: Scalars['String']['input'];
  currency: CurrencyEnum;
  memo?: InputMaybe<Scalars['String']['input']>;
  recipient: Scalars['Address']['input'];
  sender: Scalars['Address']['input'];
};


export type ActionQueryTransferAssetsArgs = {
  memo?: InputMaybe<Scalars['String']['input']>;
  recipients: Array<RecipientsInputType>;
  sender: Scalars['Address']['input'];
};


export type ActionQueryUnloadFromMyGaragesArgs = {
  fungibleAssetValues?: InputMaybe<Array<BalanceInput>>;
  fungibleIdAndCounts?: InputMaybe<Array<FungibleIdAndCountInput>>;
  memo?: InputMaybe<Scalars['String']['input']>;
  recipientAvatarAddr: Scalars['Address']['input'];
};


export type ActionQueryUnlockEquipmentRecipeArgs = {
  avatarAddress: Scalars['Address']['input'];
  recipeIds: Array<InputMaybe<Scalars['Int']['input']>>;
};


export type ActionQueryUnlockWorldArgs = {
  avatarAddress: Scalars['Address']['input'];
  worldIds: Array<InputMaybe<Scalars['Int']['input']>>;
};

export type ActionTxQuery = {
  __typename?: 'ActionTxQuery';
  /** @deprecated Since NCIP-15, it doesn't care account activation. */
  activateAccount: Scalars['ByteString']['output'];
  approvePledge: Scalars['ByteString']['output'];
  auraSummon: Scalars['ByteString']['output'];
  claimItems: Scalars['ByteString']['output'];
  claimRaidReward: Scalars['ByteString']['output'];
  claimStakeReward?: Maybe<Scalars['ByteString']['output']>;
  claimWorldBossKillReward: Scalars['ByteString']['output'];
  combinationConsumable: Scalars['ByteString']['output'];
  combinationEquipment: Scalars['ByteString']['output'];
  craftQuery: CraftQuery;
  createAvatar: Scalars['ByteString']['output'];
  createPledge: Scalars['ByteString']['output'];
  dailyReward: Scalars['ByteString']['output'];
  deliverToOthersGarages: Scalars['ByteString']['output'];
  endPledge: Scalars['ByteString']['output'];
  grinding?: Maybe<Scalars['ByteString']['output']>;
  hackAndSlash: Scalars['ByteString']['output'];
  hackAndSlashSweep: Scalars['ByteString']['output'];
  itemEnhancement: Scalars['ByteString']['output'];
  loadIntoMyGarages: Scalars['ByteString']['output'];
  migrateMonsterCollection: Scalars['ByteString']['output'];
  patchTableSheet: Scalars['ByteString']['output'];
  prepareRewardAssets: Scalars['ByteString']['output'];
  raid: Scalars['ByteString']['output'];
  rapidCombination: Scalars['ByteString']['output'];
  requestPledge: Scalars['ByteString']['output'];
  runeEnhancement: Scalars['ByteString']['output'];
  stake?: Maybe<Scalars['ByteString']['output']>;
  transferAsset?: Maybe<Scalars['ByteString']['output']>;
  transferAssets: Scalars['ByteString']['output'];
  unloadFromMyGarages: Scalars['ByteString']['output'];
  unlockEquipmentRecipe?: Maybe<Scalars['ByteString']['output']>;
  unlockWorld?: Maybe<Scalars['ByteString']['output']>;
};


export type ActionTxQueryActivateAccountArgs = {
  activationCode: Scalars['String']['input'];
};


export type ActionTxQueryApprovePledgeArgs = {
  patronAddress: Scalars['Address']['input'];
};


export type ActionTxQueryAuraSummonArgs = {
  avatarAddress: Scalars['Address']['input'];
  groupId: Scalars['Int']['input'];
  summonCount: Scalars['Int']['input'];
};


export type ActionTxQueryClaimItemsArgs = {
  claimData: Array<ClaimDataInputType>;
};


export type ActionTxQueryClaimRaidRewardArgs = {
  avatarAddress: Scalars['Address']['input'];
};


export type ActionTxQueryClaimStakeRewardArgs = {
  avatarAddress?: InputMaybe<Scalars['Address']['input']>;
};


export type ActionTxQueryClaimWorldBossKillRewardArgs = {
  avatarAddress: Scalars['Address']['input'];
};


export type ActionTxQueryCombinationConsumableArgs = {
  avatarAddress: Scalars['Address']['input'];
  recipeId: Scalars['Int']['input'];
  slotIndex: Scalars['Int']['input'];
};


export type ActionTxQueryCombinationEquipmentArgs = {
  avatarAddress: Scalars['Address']['input'];
  payByCrystal?: InputMaybe<Scalars['Boolean']['input']>;
  recipeId: Scalars['Int']['input'];
  slotIndex: Scalars['Int']['input'];
  subRecipeId?: InputMaybe<Scalars['Int']['input']>;
  useHammerPoint?: InputMaybe<Scalars['Boolean']['input']>;
};


export type ActionTxQueryCreateAvatarArgs = {
  ear?: InputMaybe<Scalars['Int']['input']>;
  hair?: InputMaybe<Scalars['Int']['input']>;
  index: Scalars['Int']['input'];
  lens?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  tail?: InputMaybe<Scalars['Int']['input']>;
};


export type ActionTxQueryCreatePledgeArgs = {
  agentAddresses: Array<Scalars['Address']['input']>;
  mead?: InputMaybe<Scalars['Int']['input']>;
  patronAddress: Scalars['Address']['input'];
};


export type ActionTxQueryDailyRewardArgs = {
  avatarAddress: Scalars['Address']['input'];
};


export type ActionTxQueryDeliverToOthersGaragesArgs = {
  fungibleAssetValues?: InputMaybe<Array<SimplifyFungibleAssetValueInput>>;
  fungibleIdAndCounts?: InputMaybe<Array<FungibleIdAndCountInput>>;
  memo?: InputMaybe<Scalars['String']['input']>;
  recipientAgentAddr: Scalars['Address']['input'];
};


export type ActionTxQueryEndPledgeArgs = {
  agentAddress: Scalars['Address']['input'];
};


export type ActionTxQueryGrindingArgs = {
  avatarAddress: Scalars['Address']['input'];
  chargeAp?: InputMaybe<Scalars['Boolean']['input']>;
  equipmentIds: Array<InputMaybe<Scalars['Guid']['input']>>;
};


export type ActionTxQueryHackAndSlashArgs = {
  avatarAddress: Scalars['Address']['input'];
  consumableIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  costumeIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  equipmentIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  runeSlotInfos?: InputMaybe<Array<RuneSlotInfoInputType>>;
  stageBuffId?: InputMaybe<Scalars['Int']['input']>;
  stageId: Scalars['Int']['input'];
  worldId: Scalars['Int']['input'];
};


export type ActionTxQueryHackAndSlashSweepArgs = {
  actionPoint: Scalars['Int']['input'];
  apStoneCount?: InputMaybe<Scalars['Int']['input']>;
  avatarAddress: Scalars['Address']['input'];
  costumeIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  equipmentIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  runeSlotInfos?: InputMaybe<Array<RuneSlotInfoInputType>>;
  stageId: Scalars['Int']['input'];
  worldId: Scalars['Int']['input'];
};


export type ActionTxQueryItemEnhancementArgs = {
  avatarAddress: Scalars['Address']['input'];
  itemId: Scalars['Guid']['input'];
  materialIds: Array<Scalars['Guid']['input']>;
  slotIndex: Scalars['Int']['input'];
};


export type ActionTxQueryLoadIntoMyGaragesArgs = {
  fungibleAssetValues?: InputMaybe<Array<BalanceInput>>;
  fungibleIdAndCounts?: InputMaybe<Array<FungibleIdAndCountInput>>;
  inventoryAddr?: InputMaybe<Scalars['Address']['input']>;
  memo?: InputMaybe<Scalars['String']['input']>;
};


export type ActionTxQueryMigrateMonsterCollectionArgs = {
  avatarAddress?: InputMaybe<Scalars['Address']['input']>;
};


export type ActionTxQueryPatchTableSheetArgs = {
  tableCsv: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
};


export type ActionTxQueryPrepareRewardAssetsArgs = {
  assets: Array<FungibleAssetValueInputType>;
  rewardPoolAddress: Scalars['Address']['input'];
};


export type ActionTxQueryRaidArgs = {
  avatarAddress: Scalars['Address']['input'];
  costumeIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  equipmentIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  foodIds?: InputMaybe<Array<InputMaybe<Scalars['Guid']['input']>>>;
  payNcg?: InputMaybe<Scalars['Boolean']['input']>;
  runeSlotInfos?: InputMaybe<Array<RuneSlotInfoInputType>>;
};


export type ActionTxQueryRapidCombinationArgs = {
  avatarAddress: Scalars['Address']['input'];
  slotIndex: Scalars['Int']['input'];
};


export type ActionTxQueryRequestPledgeArgs = {
  agentAddress: Scalars['Address']['input'];
  mead?: InputMaybe<Scalars['Int']['input']>;
};


export type ActionTxQueryRuneEnhancementArgs = {
  avatarAddress: Scalars['Address']['input'];
  runeId: Scalars['Int']['input'];
  tryCount?: InputMaybe<Scalars['Int']['input']>;
};


export type ActionTxQueryStakeArgs = {
  amount?: InputMaybe<Scalars['BigInt']['input']>;
};


export type ActionTxQueryTransferAssetArgs = {
  amount: Scalars['String']['input'];
  currency: CurrencyEnum;
  memo?: InputMaybe<Scalars['String']['input']>;
  recipient: Scalars['Address']['input'];
  sender: Scalars['Address']['input'];
};


export type ActionTxQueryTransferAssetsArgs = {
  memo?: InputMaybe<Scalars['String']['input']>;
  recipients: Array<RecipientsInputType>;
  sender: Scalars['Address']['input'];
};


export type ActionTxQueryUnloadFromMyGaragesArgs = {
  fungibleAssetValues?: InputMaybe<Array<BalanceInput>>;
  fungibleIdAndCounts?: InputMaybe<Array<FungibleIdAndCountInput>>;
  memo?: InputMaybe<Scalars['String']['input']>;
  recipientAvatarAddr: Scalars['Address']['input'];
};


export type ActionTxQueryUnlockEquipmentRecipeArgs = {
  avatarAddress: Scalars['Address']['input'];
  recipeIds: Array<InputMaybe<Scalars['Int']['input']>>;
};


export type ActionTxQueryUnlockWorldArgs = {
  avatarAddress: Scalars['Address']['input'];
  worldIds: Array<InputMaybe<Scalars['Int']['input']>>;
};

export type ActivationStatusMutation = {
  __typename?: 'ActivationStatusMutation';
  /** @deprecated Since NCIP-15, it doesn't care account activation. */
  activateAccount: Scalars['Boolean']['output'];
};


export type ActivationStatusMutationActivateAccountArgs = {
  encodedActivationKey: Scalars['String']['input'];
};

export type ActivationStatusQuery = {
  __typename?: 'ActivationStatusQuery';
  /** @deprecated Since NCIP-15, it doesn't care account activation. */
  activated: Scalars['Boolean']['output'];
  /** @deprecated Since NCIP-15, it doesn't care account activation. */
  addressActivated: Scalars['Boolean']['output'];
};


export type ActivationStatusQueryAddressActivatedArgs = {
  address: Scalars['Address']['input'];
};

export type AddressQuery = {
  __typename?: 'AddressQuery';
  currencyMintersAddress?: Maybe<Array<Scalars['Address']['output']>>;
  pledgeAddress: Scalars['Address']['output'];
  raiderAddress: Scalars['Address']['output'];
  raiderListAddress: Scalars['Address']['output'];
  worldBossAddress: Scalars['Address']['output'];
  worldBossKillRewardRecordAddress: Scalars['Address']['output'];
};


export type AddressQueryCurrencyMintersAddressArgs = {
  currency: CurrencyEnum;
};


export type AddressQueryPledgeAddressArgs = {
  agentAddress: Scalars['Address']['input'];
};


export type AddressQueryRaiderAddressArgs = {
  avatarAddress: Scalars['Address']['input'];
  raidId: Scalars['Int']['input'];
};


export type AddressQueryRaiderListAddressArgs = {
  raidId: Scalars['Int']['input'];
};


export type AddressQueryWorldBossAddressArgs = {
  raidId: Scalars['Int']['input'];
};


export type AddressQueryWorldBossKillRewardRecordAddressArgs = {
  avatarAddress: Scalars['Address']['input'];
  raidId: Scalars['Int']['input'];
};

export type AgentStateType = {
  __typename?: 'AgentStateType';
  address: Scalars['Address']['output'];
  avatarStates?: Maybe<Array<AvatarStateType>>;
  crystal: Scalars['String']['output'];
  gold: Scalars['String']['output'];
  hasTradedItem: Scalars['Boolean']['output'];
  monsterCollectionLevel: Scalars['Long']['output'];
  monsterCollectionRound: Scalars['Long']['output'];
  pledge: MeadPledgeType;
};

export type AppProtocolVersionType = {
  __typename?: 'AppProtocolVersionType';
  extra?: Maybe<Scalars['ByteString']['output']>;
  signature: Scalars['ByteString']['output'];
  signer: Scalars['Address']['output'];
  version: Scalars['Int']['output'];
};

export type ArenaInfoType = {
  __typename?: 'ArenaInfoType';
  active: Scalars['Boolean']['output'];
  agentAddress: Scalars['Address']['output'];
  arenaRecord: ArenaRecordType;
  avatarAddress: Scalars['Address']['output'];
  avatarName: Scalars['String']['output'];
  dailyChallengeCount: Scalars['Int']['output'];
  score: Scalars['Int']['output'];
};

export type ArenaInformationType = {
  __typename?: 'ArenaInformationType';
  address: Scalars['Address']['output'];
  avatarAddress: Scalars['Address']['output'];
  lose: Scalars['Int']['output'];
  purchasedTicketCount: Scalars['Int']['output'];
  score: Scalars['Int']['output'];
  ticket: Scalars['Int']['output'];
  ticketResetCount: Scalars['Int']['output'];
  win: Scalars['Int']['output'];
};

export type ArenaParticipantType = {
  __typename?: 'ArenaParticipantType';
  avatarAddr: Scalars['Address']['output'];
  cp: Scalars['Int']['output'];
  level: Scalars['Int']['output'];
  loseScore: Scalars['Int']['output'];
  nameWithHash: Scalars['String']['output'];
  portraitId: Scalars['Int']['output'];
  rank: Scalars['Int']['output'];
  score: Scalars['Int']['output'];
  winScore: Scalars['Int']['output'];
};

export type ArenaRecordType = {
  __typename?: 'ArenaRecordType';
  draw?: Maybe<Scalars['Int']['output']>;
  lose?: Maybe<Scalars['Int']['output']>;
  win?: Maybe<Scalars['Int']['output']>;
};

export type AvatarStateType = {
  __typename?: 'AvatarStateType';
  actionPoint: Scalars['Int']['output'];
  address: Scalars['Address']['output'];
  agentAddress: Scalars['Address']['output'];
  blockIndex: Scalars['Int']['output'];
  characterId: Scalars['Int']['output'];
  combinationSlotAddresses: Array<Scalars['Address']['output']>;
  combinationSlots: Array<CombinationSlotStateType>;
  dailyRewardReceivedIndex: Scalars['Long']['output'];
  ear: Scalars['Int']['output'];
  eventMap: CollectionMapType;
  exp: Scalars['Int']['output'];
  hair: Scalars['Int']['output'];
  index: Scalars['Int']['output'];
  inventory: InventoryType;
  inventoryAddress: Scalars['Address']['output'];
  itemMap: CollectionMapType;
  lens: Scalars['Int']['output'];
  level: Scalars['Int']['output'];
  mailBox: MailBoxType;
  monsterMap: CollectionMapType;
  name: Scalars['String']['output'];
  questList: QuestListType;
  runes: Array<RuneStateType>;
  stageMap: CollectionMapType;
  tail: Scalars['Int']['output'];
  updatedAt: Scalars['Long']['output'];
  worldInformation: WorldInformationType;
};

export type BalanceInput = {
  balanceAddr?: InputMaybe<Scalars['Address']['input']>;
  value?: InputMaybe<SimplifyFungibleAssetValueInput>;
};

export type Block = {
  __typename?: 'Block';
  /** @deprecated Block does not have Difficulty field in PBFT. */
  difficulty: Scalars['Long']['output'];
  hash: Scalars['ID']['output'];
  index: Scalars['Long']['output'];
  lastCommit?: Maybe<BlockCommit>;
  miner: Scalars['Address']['output'];
  /** @deprecated Block does not have Nonce field in PBFT. */
  nonce: Scalars['ByteString']['output'];
  preEvaluationHash: Scalars['ByteString']['output'];
  previousBlock?: Maybe<Block>;
  publicKey?: Maybe<Scalars['PublicKey']['output']>;
  signature?: Maybe<Scalars['ByteString']['output']>;
  stateRootHash: Scalars['ByteString']['output'];
  timestamp: Scalars['DateTimeOffset']['output'];
  /** @deprecated Block does not have TotalDifficulty field in PBFT. */
  totalDifficulty: Scalars['BigInt']['output'];
  transactions: Array<Transaction>;
};

export type BlockCommit = {
  __typename?: 'BlockCommit';
  blockHash: Scalars['ID']['output'];
  height: Scalars['Long']['output'];
  round: Scalars['Int']['output'];
  votes: Array<Vote>;
};

export type BlockHeader = {
  __typename?: 'BlockHeader';
  hash: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  index: Scalars['Int']['output'];
  miner?: Maybe<Scalars['Address']['output']>;
};

export type BlockQuery = {
  __typename?: 'BlockQuery';
  block?: Maybe<Block>;
  blocks: Array<Block>;
};


export type BlockQueryBlockArgs = {
  hash?: InputMaybe<Scalars['ID']['input']>;
  index?: InputMaybe<Scalars['ID']['input']>;
};


export type BlockQueryBlocksArgs = {
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  excludeEmptyTxs?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  miner?: InputMaybe<Scalars['Address']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type BoundPeer = {
  __typename?: 'BoundPeer';
  endPoint: Scalars['String']['output'];
  publicIpAddress?: Maybe<Scalars['String']['output']>;
  publicKey: Scalars['PublicKey']['output'];
};

export type ClaimDataInputType = {
  avatarAddress: Scalars['Address']['input'];
  fungibleAssetValues: Array<FungibleAssetValueInputType>;
};

export type CollectionMapType = {
  __typename?: 'CollectionMapType';
  count: Scalars['Int']['output'];
  pairs: Array<Array<Maybe<Scalars['Int']['output']>>>;
};

export type CombinationSlotStateType = {
  __typename?: 'CombinationSlotStateType';
  address: Scalars['Address']['output'];
  petId?: Maybe<Scalars['Int']['output']>;
  startBlockIndex: Scalars['Long']['output'];
  unlockBlockIndex: Scalars['Long']['output'];
  unlockStage: Scalars['Int']['output'];
};

export type ConsumableType = {
  __typename?: 'ConsumableType';
  elementalType: ElementalType;
  grade: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  itemId: Scalars['Guid']['output'];
  itemSubType: ItemSubType;
  itemType: ItemType;
  mainStat: StatType;
  requiredBlockIndex?: Maybe<Scalars['Long']['output']>;
};

export type CostumeType = {
  __typename?: 'CostumeType';
  elementalType: ElementalType;
  equipped: Scalars['Boolean']['output'];
  grade: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  itemId: Scalars['Guid']['output'];
  itemSubType: ItemSubType;
  itemType: ItemType;
  requiredBlockIndex?: Maybe<Scalars['Long']['output']>;
};

export type CraftQuery = {
  __typename?: 'CraftQuery';
  eventConsumableItemCrafts: Scalars['ByteString']['output'];
  eventMaterialItemCrafts: Scalars['ByteString']['output'];
};


export type CraftQueryEventConsumableItemCraftsArgs = {
  avatarAddress: Scalars['Address']['input'];
  eventConsumableItemRecipeId: Scalars['Int']['input'];
  eventScheduleId: Scalars['Int']['input'];
  slotIndex: Scalars['Int']['input'];
};


export type CraftQueryEventMaterialItemCraftsArgs = {
  avatarAddress: Scalars['Address']['input'];
  eventMaterialItemRecipeId: Scalars['Int']['input'];
  eventScheduleId: Scalars['Int']['input'];
  materialsToUse: Array<MaterialsToUseInputType>;
};

export type CrystalMonsterCollectionMultiplierRowType = {
  __typename?: 'CrystalMonsterCollectionMultiplierRowType';
  level: Scalars['Int']['output'];
  multiplier: Scalars['Int']['output'];
};

export type CrystalMonsterCollectionMultiplierSheetType = {
  __typename?: 'CrystalMonsterCollectionMultiplierSheetType';
  orderedList: Array<CrystalMonsterCollectionMultiplierRowType>;
};

export type Currency = {
  __typename?: 'Currency';
  decimalPlaces: Scalars['Byte']['output'];
  hash: Scalars['ByteString']['output'];
  maximumSupply?: Maybe<FungibleAssetValue>;
  minters?: Maybe<Array<Scalars['Address']['output']>>;
  ticker: Scalars['String']['output'];
  totalSupplyTrackable: Scalars['Boolean']['output'];
};

export enum CurrencyEnum {
  Crystal = 'CRYSTAL',
  Garage = 'GARAGE',
  Mead = 'MEAD',
  Ncg = 'NCG'
}

export type CurrencyInput = {
  decimalPlaces: Scalars['Byte']['input'];
  maximumSupplyMajorUnit?: InputMaybe<Scalars['BigInt']['input']>;
  maximumSupplyMinorUnit?: InputMaybe<Scalars['BigInt']['input']>;
  minters?: InputMaybe<Array<Scalars['Address']['input']>>;
  ticker: Scalars['String']['input'];
  totalSupplyTrackable?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CurrencyType = {
  __typename?: 'CurrencyType';
  decimalPlaces: Scalars['Byte']['output'];
  minters?: Maybe<Array<Maybe<Scalars['Address']['output']>>>;
  ticker: Scalars['String']['output'];
};

export type DecimalStatType = {
  __typename?: 'DecimalStatType';
  additionalValue: Scalars['Decimal']['output'];
  baseValue: Scalars['Decimal']['output'];
  statType: StatType;
  totalValue: Scalars['Decimal']['output'];
};

export type DifferentAppProtocolVersionEncounterType = {
  __typename?: 'DifferentAppProtocolVersionEncounterType';
  localVersion: AppProtocolVersionType;
  peer: Scalars['String']['output'];
  peerVersion: AppProtocolVersionType;
};

export enum ElementalType {
  Fire = 'FIRE',
  Land = 'LAND',
  Normal = 'NORMAL',
  Water = 'WATER',
  Wind = 'WIND'
}

export type EquipmentType = {
  __typename?: 'EquipmentType';
  buffSkills?: Maybe<Array<Maybe<SkillType>>>;
  elementalType: ElementalType;
  equipped: Scalars['Boolean']['output'];
  exp: Scalars['Int']['output'];
  grade: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  itemId: Scalars['Guid']['output'];
  itemSubType: ItemSubType;
  itemType: ItemType;
  level: Scalars['Int']['output'];
  requiredBlockIndex?: Maybe<Scalars['Long']['output']>;
  setId: Scalars['Int']['output'];
  skills?: Maybe<Array<Maybe<SkillType>>>;
  stat: DecimalStatType;
  statsMap: StatsMapType;
};

export type ExplorerQuery = {
  __typename?: 'ExplorerQuery';
  blockQuery?: Maybe<BlockQuery>;
  nodeState: NodeState;
  stateQuery?: Maybe<LibplanetStateQuery>;
  transactionQuery?: Maybe<TransactionQuery>;
};

export type FungibleAssetValue = {
  __typename?: 'FungibleAssetValue';
  currency: Currency;
  majorUnit: Scalars['BigInt']['output'];
  minorUnit: Scalars['BigInt']['output'];
  quantity: Scalars['String']['output'];
  sign: Scalars['Int']['output'];
  string: Scalars['String']['output'];
};

export type FungibleAssetValueInputType = {
  decimalPlaces: Scalars['Byte']['input'];
  minters?: InputMaybe<Array<Scalars['Address']['input']>>;
  quantity: Scalars['BigInt']['input'];
  ticker: Scalars['String']['input'];
};

export type FungibleAssetValueType = {
  __typename?: 'FungibleAssetValueType';
  currency: Scalars['String']['output'];
  quantity: Scalars['String']['output'];
};

export type FungibleAssetValueWithCurrencyType = {
  __typename?: 'FungibleAssetValueWithCurrencyType';
  currency: CurrencyType;
  quantity: Scalars['String']['output'];
};


export type FungibleAssetValueWithCurrencyTypeQuantityArgs = {
  minerUnit?: InputMaybe<Scalars['Boolean']['input']>;
};

export type FungibleIdAndCountInput = {
  count: Scalars['Int']['input'];
  fungibleId: Scalars['String']['input'];
};

export type FungibleItemGarageWithAddressType = {
  __typename?: 'FungibleItemGarageWithAddressType';
  addr?: Maybe<Scalars['Address']['output']>;
  count?: Maybe<Scalars['Int']['output']>;
  fungibleItemId?: Maybe<Scalars['String']['output']>;
  item?: Maybe<FungibleItemType>;
};

export type FungibleItemType = {
  __typename?: 'FungibleItemType';
  fungibleItemId: Scalars['String']['output'];
  itemSubType: ItemSubType;
  itemType: ItemType;
};

export type GaragesType = {
  __typename?: 'GaragesType';
  agentAddr?: Maybe<Scalars['Address']['output']>;
  fungibleItemGarages?: Maybe<Array<Maybe<FungibleItemGarageWithAddressType>>>;
  garageBalances?: Maybe<Array<Maybe<FungibleAssetValue>>>;
  garageBalancesAddr?: Maybe<Scalars['Address']['output']>;
};

export type InventoryItemType = {
  __typename?: 'InventoryItemType';
  count: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  itemType: ItemType;
  lockId?: Maybe<Scalars['Guid']['output']>;
  locked: Scalars['Boolean']['output'];
  tradableId?: Maybe<Scalars['Guid']['output']>;
};

export type InventoryType = {
  __typename?: 'InventoryType';
  consumables: Array<ConsumableType>;
  costumes: Array<CostumeType>;
  equipments: Array<EquipmentType>;
  items: Array<InventoryItemType>;
  materials: Array<MaterialType>;
};


export type InventoryTypeEquipmentsArgs = {
  equipped?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<Scalars['Int']['input']>>;
  itemIds?: InputMaybe<Array<Scalars['Guid']['input']>>;
  itemSubType?: InputMaybe<ItemSubType>;
};


export type InventoryTypeItemsArgs = {
  inventoryItemId?: InputMaybe<Scalars['Int']['input']>;
  locked?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum ItemSubType {
  ApStone = 'AP_STONE',
  Armor = 'ARMOR',
  Aura = 'AURA',
  Belt = 'BELT',
  /** @deprecated ItemSubType.Chest has never been used outside the MaterialItemSheet. And we won't use it in the future until we have a specific reason. */
  Chest = 'CHEST',
  EarCostume = 'EAR_COSTUME',
  EquipmentMaterial = 'EQUIPMENT_MATERIAL',
  EyeCostume = 'EYE_COSTUME',
  Food = 'FOOD',
  FoodMaterial = 'FOOD_MATERIAL',
  FullCostume = 'FULL_COSTUME',
  HairCostume = 'HAIR_COSTUME',
  Hourglass = 'HOURGLASS',
  MonsterPart = 'MONSTER_PART',
  Necklace = 'NECKLACE',
  NormalMaterial = 'NORMAL_MATERIAL',
  Ring = 'RING',
  TailCostume = 'TAIL_COSTUME',
  Title = 'TITLE',
  Weapon = 'WEAPON'
}

export enum ItemType {
  Consumable = 'CONSUMABLE',
  Costume = 'COSTUME',
  Equipment = 'EQUIPMENT',
  Material = 'MATERIAL'
}

export type ItemUsableType = {
  __typename?: 'ItemUsableType';
  elementalType: ElementalType;
  grade: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  itemId: Scalars['Guid']['output'];
  itemSubType: ItemSubType;
  itemType: ItemType;
  requiredBlockIndex?: Maybe<Scalars['Long']['output']>;
};

export type KeyStoreMutation = {
  __typename?: 'KeyStoreMutation';
  createPrivateKey: PrivateKeyType;
  revokePrivateKey: ProtectedPrivateKeyType;
};


export type KeyStoreMutationCreatePrivateKeyArgs = {
  passphrase: Scalars['String']['input'];
  privateKey?: InputMaybe<Scalars['ByteString']['input']>;
};


export type KeyStoreMutationRevokePrivateKeyArgs = {
  address: Scalars['Address']['input'];
};

export type KeyStoreType = {
  __typename?: 'KeyStoreType';
  decryptedPrivateKey: Scalars['ByteString']['output'];
  privateKey: PrivateKeyType;
  protectedPrivateKeys: Array<ProtectedPrivateKeyType>;
};


export type KeyStoreTypeDecryptedPrivateKeyArgs = {
  address: Scalars['Address']['input'];
  passphrase: Scalars['String']['input'];
};


export type KeyStoreTypePrivateKeyArgs = {
  hex: Scalars['ByteString']['input'];
};

export type LibplanetStateQuery = {
  __typename?: 'LibplanetStateQuery';
  balance: FungibleAssetValue;
  states: Array<Maybe<Scalars['BencodexValue']['output']>>;
  totalSupply?: Maybe<FungibleAssetValue>;
  validators?: Maybe<Array<Validator>>;
};


export type LibplanetStateQueryBalanceArgs = {
  currency: CurrencyInput;
  offsetBlockHash?: InputMaybe<Scalars['ID']['input']>;
  offsetStateRootHash?: InputMaybe<Scalars['HashDigest_SHA256']['input']>;
  owner: Scalars['Address']['input'];
};


export type LibplanetStateQueryStatesArgs = {
  addresses: Array<Scalars['Address']['input']>;
  offsetBlockHash?: InputMaybe<Scalars['ID']['input']>;
  offsetStateRootHash?: InputMaybe<Scalars['HashDigest_SHA256']['input']>;
};


export type LibplanetStateQueryTotalSupplyArgs = {
  currency: CurrencyInput;
  offsetBlockHash?: InputMaybe<Scalars['ID']['input']>;
  offsetStateRootHash?: InputMaybe<Scalars['HashDigest_SHA256']['input']>;
};


export type LibplanetStateQueryValidatorsArgs = {
  offsetBlockHash?: InputMaybe<Scalars['ID']['input']>;
  offsetStateRootHash?: InputMaybe<Scalars['HashDigest_SHA256']['input']>;
};

export type MailBoxType = {
  __typename?: 'MailBoxType';
  count: Scalars['Int']['output'];
  mails: Array<MailType>;
};

export type MailType = {
  __typename?: 'MailType';
  blockIndex: Scalars['Long']['output'];
  id: Scalars['Guid']['output'];
  requiredBlockIndex: Scalars['Long']['output'];
};

export type MaterialType = {
  __typename?: 'MaterialType';
  elementalType: ElementalType;
  grade: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  itemId: Scalars['ByteString']['output'];
  itemSubType: ItemSubType;
  itemType: ItemType;
  requiredBlockIndex?: Maybe<Scalars['Long']['output']>;
};

export type MaterialsToUseInputType = {
  materialId: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
};

export type MeadPledgeType = {
  __typename?: 'MeadPledgeType';
  approved: Scalars['Boolean']['output'];
  mead: Scalars['Int']['output'];
  patronAddress?: Maybe<Scalars['Address']['output']>;
};

export type MonsterCollectionRewardInfoType = {
  __typename?: 'MonsterCollectionRewardInfoType';
  itemId: Scalars['Int']['output'];
  quantity: Scalars['Int']['output'];
};

export type MonsterCollectionRowType = {
  __typename?: 'MonsterCollectionRowType';
  level: Scalars['Int']['output'];
  requiredGold: Scalars['Int']['output'];
  rewards: Array<Maybe<MonsterCollectionRewardInfoType>>;
};

export type MonsterCollectionSheetType = {
  __typename?: 'MonsterCollectionSheetType';
  orderedList?: Maybe<Array<Maybe<MonsterCollectionRowType>>>;
};

export type MonsterCollectionStateType = {
  __typename?: 'MonsterCollectionStateType';
  address: Scalars['Address']['output'];
  claimableBlockIndex: Scalars['Long']['output'];
  expiredBlockIndex: Scalars['Long']['output'];
  level: Scalars['Long']['output'];
  receivedBlockIndex: Scalars['Long']['output'];
  rewardLevel: Scalars['Long']['output'];
  startedBlockIndex: Scalars['Long']['output'];
};

export type MonsterCollectionStatusType = {
  __typename?: 'MonsterCollectionStatusType';
  fungibleAssetValue: FungibleAssetValueType;
  lockup: Scalars['Boolean']['output'];
  rewardInfos?: Maybe<Array<Maybe<MonsterCollectionRewardInfoType>>>;
  tipIndex: Scalars['Long']['output'];
};

export type MultiAccountInfo = {
  __typename?: 'MultiAccountInfo';
  agents?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  agentsCount?: Maybe<Scalars['Int']['output']>;
  ips?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  ipsCount?: Maybe<Scalars['Int']['output']>;
  key: Scalars['String']['output'];
};

export type NodeExceptionType = {
  __typename?: 'NodeExceptionType';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
};

export type NodeState = {
  __typename?: 'NodeState';
  peers?: Maybe<Array<BoundPeer>>;
  preloaded: Scalars['Boolean']['output'];
  validators?: Maybe<Array<BoundPeer>>;
};

export type NodeStatusType = {
  __typename?: 'NodeStatusType';
  appProtocolVersion?: Maybe<AppProtocolVersionType>;
  bootstrapEnded: Scalars['Boolean']['output'];
  genesis: BlockHeader;
  informationalVersion?: Maybe<Scalars['String']['output']>;
  isMining: Scalars['Boolean']['output'];
  preloadEnded: Scalars['Boolean']['output'];
  productVersion?: Maybe<Scalars['String']['output']>;
  stagedTxIds?: Maybe<Array<Maybe<Scalars['TxId']['output']>>>;
  stagedTxIdsCount?: Maybe<Scalars['Int']['output']>;
  subscriberAddresses?: Maybe<Array<Maybe<Scalars['Address']['output']>>>;
  subscriberAddressesCount?: Maybe<Scalars['Int']['output']>;
  tip: BlockHeader;
  topmostBlocks: Array<Maybe<BlockHeader>>;
};


export type NodeStatusTypeStagedTxIdsArgs = {
  address?: InputMaybe<Scalars['Address']['input']>;
};


export type NodeStatusTypeTopmostBlocksArgs = {
  limit: Scalars['Int']['input'];
  miner?: InputMaybe<Scalars['Address']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export enum NotificationEnum {
  Buyer = 'BUYER',
  CombinationConsumable = 'COMBINATION_CONSUMABLE',
  CombinationEquipment = 'COMBINATION_EQUIPMENT',
  Has = 'HAS',
  Refill = 'REFILL',
  Seller = 'SELLER'
}

export type NotificationType = {
  __typename?: 'NotificationType';
  message?: Maybe<Scalars['String']['output']>;
  type: NotificationEnum;
};

export type OrderDigestListStateType = {
  __typename?: 'OrderDigestListStateType';
  address?: Maybe<Scalars['Address']['output']>;
  orderDigestList: Array<Maybe<OrderDigestType>>;
};

export type OrderDigestType = {
  __typename?: 'OrderDigestType';
  combatPoint: Scalars['Int']['output'];
  expiredBlockIndex: Scalars['Int']['output'];
  itemCount: Scalars['Int']['output'];
  itemId: Scalars['Int']['output'];
  level: Scalars['Int']['output'];
  orderId: Scalars['Guid']['output'];
  price: Scalars['String']['output'];
  sellerAgentAddress: Scalars['Address']['output'];
  startedBlockIndex: Scalars['Int']['output'];
  tradableId: Scalars['Guid']['output'];
};

export type PeerChainStateQuery = {
  __typename?: 'PeerChainStateQuery';
  state: Array<Maybe<Scalars['String']['output']>>;
};

export type PreloadStateExtraType = {
  __typename?: 'PreloadStateExtraType';
  currentCount: Scalars['Long']['output'];
  totalCount: Scalars['Long']['output'];
  type: Scalars['String']['output'];
};

export type PreloadStateType = {
  __typename?: 'PreloadStateType';
  currentPhase: Scalars['Long']['output'];
  extra: PreloadStateExtraType;
  totalPhase: Scalars['Long']['output'];
};

export type PrivateKeyType = {
  __typename?: 'PrivateKeyType';
  hex: Scalars['ByteString']['output'];
  publicKey: PublicKeyType;
};

export type ProtectedPrivateKeyType = {
  __typename?: 'ProtectedPrivateKeyType';
  address: Scalars['Address']['output'];
};

export type PublicKeyType = {
  __typename?: 'PublicKeyType';
  address: Scalars['Address']['output'];
  hex: Scalars['ByteString']['output'];
};


export type PublicKeyTypeHexArgs = {
  compress?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QuestListType = {
  __typename?: 'QuestListType';
  completedQuestIds: Array<Scalars['Int']['output']>;
};

export type RaiderStateType = {
  __typename?: 'RaiderStateType';
  avatarAddress: Scalars['Address']['output'];
  avatarName: Scalars['String']['output'];
  claimedBlockIndex: Scalars['Long']['output'];
  cp: Scalars['Int']['output'];
  highScore: Scalars['Int']['output'];
  iconId: Scalars['Int']['output'];
  latestBossLevel: Scalars['Int']['output'];
  latestRewardRank: Scalars['Int']['output'];
  level: Scalars['Int']['output'];
  purchaseCount: Scalars['Int']['output'];
  refillBlockIndex: Scalars['Long']['output'];
  remainChallengeCount: Scalars['Int']['output'];
  totalChallengeCount: Scalars['Int']['output'];
  totalScore: Scalars['Int']['output'];
};

export type RankingInfoType = {
  __typename?: 'RankingInfoType';
  agentAddress: Scalars['Address']['output'];
  armorId: Scalars['Int']['output'];
  avatarAddress: Scalars['Address']['output'];
  avatarName: Scalars['String']['output'];
  exp: Scalars['Long']['output'];
  level: Scalars['Int']['output'];
  stageClearedBlockIndex: Scalars['Long']['output'];
  updatedAt: Scalars['Long']['output'];
};

export type RankingMapStateType = {
  __typename?: 'RankingMapStateType';
  address: Scalars['Address']['output'];
  capacity: Scalars['Int']['output'];
  rankingInfos: Array<RankingInfoType>;
};

export type RecipientsInputType = {
  amount: FungibleAssetValueInputType;
  recipient: Scalars['Address']['input'];
};

export type RpcInformationQuery = {
  __typename?: 'RpcInformationQuery';
  clients: Array<Maybe<Scalars['Address']['output']>>;
  clientsByDevice: Array<Scalars['Address']['output']>;
  clientsByIps: Array<Maybe<MultiAccountInfo>>;
  clientsCountByIps: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
  totalCountByDevice: Scalars['Int']['output'];
};


export type RpcInformationQueryClientsByDeviceArgs = {
  device: Scalars['String']['input'];
};


export type RpcInformationQueryClientsByIpsArgs = {
  minimum: Scalars['Int']['input'];
};


export type RpcInformationQueryClientsCountByIpsArgs = {
  minimum: Scalars['Int']['input'];
};


export type RpcInformationQueryTotalCountByDeviceArgs = {
  device: Scalars['String']['input'];
};

export type RuneSlotInfoInputType = {
  runeId: Scalars['Int']['input'];
  slotIndex: Scalars['Int']['input'];
};

export type RuneStateType = {
  __typename?: 'RuneStateType';
  level: Scalars['Int']['output'];
  runeId: Scalars['Int']['output'];
};

export type ShardedShopStateV2Type = {
  __typename?: 'ShardedShopStateV2Type';
  address: Scalars['Address']['output'];
  orderDigestList: Array<Maybe<OrderDigestType>>;
};


export type ShardedShopStateV2TypeOrderDigestListArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
  maximumPrice?: InputMaybe<Scalars['Int']['input']>;
};

export type ShopItemType = {
  __typename?: 'ShopItemType';
  costume?: Maybe<CostumeType>;
  itemUsable?: Maybe<ItemUsableType>;
  price: Scalars['String']['output'];
  productId: Scalars['Guid']['output'];
  sellerAgentAddress: Scalars['Address']['output'];
  sellerAvatarAddress: Scalars['Address']['output'];
};

export type ShopStateType = {
  __typename?: 'ShopStateType';
  address: Scalars['Address']['output'];
  products: Array<Maybe<ShopItemType>>;
};


export type ShopStateTypeProductsArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
  itemSubType?: InputMaybe<ItemSubType>;
  maximumPrice?: InputMaybe<Scalars['Int']['input']>;
};

export type SimplifyFungibleAssetValueInput = {
  currencyEnum?: InputMaybe<CurrencyEnum>;
  currencyTicker?: InputMaybe<Scalars['String']['input']>;
  value: Scalars['String']['input'];
};

export type SkillType = {
  __typename?: 'SkillType';
  chance: Scalars['Int']['output'];
  elementalType: ElementalType;
  id: Scalars['Int']['output'];
  power: Scalars['Int']['output'];
  referencedStatType: StatType;
  statPowerRatio: Scalars['Int']['output'];
};

export type StakeAchievementsType = {
  __typename?: 'StakeAchievementsType';
  achievementsByLevel: Scalars['Int']['output'];
};


export type StakeAchievementsTypeAchievementsByLevelArgs = {
  level: Scalars['Int']['input'];
};

export type StakeRegularFixedRewardInfoType = {
  __typename?: 'StakeRegularFixedRewardInfoType';
  count: Scalars['Int']['output'];
  itemId: Scalars['Int']['output'];
};

export type StakeRegularRewardInfoType = {
  __typename?: 'StakeRegularRewardInfoType';
  currencyDecimalPlaces?: Maybe<Scalars['Int']['output']>;
  currencyTicker?: Maybe<Scalars['String']['output']>;
  decimalRate: Scalars['Decimal']['output'];
  itemId: Scalars['Int']['output'];
  rate: Scalars['Int']['output'];
  type: StakeRewardType;
};

export type StakeRegularRewardsType = {
  __typename?: 'StakeRegularRewardsType';
  bonusRewards: Array<StakeRegularFixedRewardInfoType>;
  level: Scalars['Int']['output'];
  requiredGold: Scalars['Long']['output'];
  rewards: Array<StakeRegularRewardInfoType>;
};

export enum StakeRewardType {
  Currency = 'CURRENCY',
  Item = 'ITEM',
  Rune = 'RUNE'
}

export type StakeRewardsType = {
  __typename?: 'StakeRewardsType';
  orderedList: Array<StakeRegularRewardsType>;
};

export type StakeStateType = {
  __typename?: 'StakeStateType';
  /** @deprecated Since StakeStateV2, the achievement became removed. */
  achievements?: Maybe<StakeAchievementsType>;
  address: Scalars['Address']['output'];
  cancellableBlockIndex: Scalars['Long']['output'];
  claimableBlockIndex: Scalars['Long']['output'];
  deposit: Scalars['String']['output'];
  receivedBlockIndex: Scalars['Long']['output'];
  stakeRewards: StakeRewardsType;
  startedBlockIndex: Scalars['Long']['output'];
};

export type StandaloneMutation = {
  __typename?: 'StandaloneMutation';
  action?: Maybe<ActionMutation>;
  /** @deprecated Since NCIP-15, it doesn't care account activation. */
  activationStatus?: Maybe<ActivationStatusMutation>;
  /** @deprecated Use `planet key` command instead.  https://www.npmjs.com/package/@planetarium/cli */
  keyStore?: Maybe<KeyStoreMutation>;
  stageTransaction: Scalars['TxId']['output'];
  stageTx: Scalars['Boolean']['output'];
  /** @deprecated API update with action query. use stageTransaction mutation */
  stageTxV2: Scalars['TxId']['output'];
  transfer?: Maybe<Scalars['TxId']['output']>;
  /** @deprecated Incorrect remittance may occur when using transferGold() to the same address consecutively. Use transfer() instead. */
  transferGold?: Maybe<Scalars['TxId']['output']>;
};


export type StandaloneMutationStageTransactionArgs = {
  payload: Scalars['String']['input'];
};


export type StandaloneMutationStageTxArgs = {
  payload: Scalars['String']['input'];
};


export type StandaloneMutationStageTxV2Args = {
  payload: Scalars['String']['input'];
};


export type StandaloneMutationTransferArgs = {
  amount: Scalars['String']['input'];
  currencyAddress?: Scalars['String']['input'];
  memo?: InputMaybe<Scalars['String']['input']>;
  recipient: Scalars['Address']['input'];
  txNonce: Scalars['Long']['input'];
};


export type StandaloneMutationTransferGoldArgs = {
  amount: Scalars['String']['input'];
  recipient: Scalars['Address']['input'];
};

export type StandaloneQuery = {
  __typename?: 'StandaloneQuery';
  actionQuery: ActionQuery;
  actionTxQuery: ActionTxQuery;
  /** @deprecated Since NCIP-15, it doesn't care account activation. */
  activated: Scalars['Boolean']['output'];
  /** @deprecated Since NCIP-15, it doesn't care account activation. */
  activationKeyNonce: Scalars['String']['output'];
  /** @deprecated Since NCIP-15, it doesn't care account activation. */
  activationStatus: ActivationStatusQuery;
  addressQuery: AddressQuery;
  /** @deprecated Use /graphql/explorer */
  chainQuery: ExplorerQuery;
  /** @deprecated The root query is not the best place for getTx so it was moved. Use transaction.getTx() */
  getTx?: Maybe<TransactionType>;
  goldBalance: Scalars['String']['output'];
  /** @deprecated Use `planet key` command instead.  https://www.npmjs.com/package/@planetarium/cli */
  keyStore?: Maybe<KeyStoreType>;
  minerAddress?: Maybe<Scalars['Address']['output']>;
  monsterCollectionStatus?: Maybe<MonsterCollectionStatusType>;
  /** @deprecated The root query is not the best place for nextTxNonce so it was moved. Use transaction.nextTxNonce() */
  nextTxNonce: Scalars['Long']['output'];
  nodeStatus: NodeStatusType;
  peerChainState: PeerChainStateQuery;
  rpcInformation: RpcInformationQuery;
  state?: Maybe<Scalars['ByteString']['output']>;
  stateQuery: StateQuery;
  transaction: TransactionHeadlessQuery;
  transferNCGHistories: Array<TransferNcgHistoryType>;
  validation: ValidationQuery;
};


export type StandaloneQueryActionTxQueryArgs = {
  maxGasPrice?: InputMaybe<FungibleAssetValueInputType>;
  nonce?: InputMaybe<Scalars['Long']['input']>;
  publicKey: Scalars['String']['input'];
  timestamp?: InputMaybe<Scalars['DateTimeOffset']['input']>;
};


export type StandaloneQueryActivatedArgs = {
  invitationCode: Scalars['String']['input'];
};


export type StandaloneQueryActivationKeyNonceArgs = {
  invitationCode: Scalars['String']['input'];
};


export type StandaloneQueryGetTxArgs = {
  txId: Scalars['TxId']['input'];
};


export type StandaloneQueryGoldBalanceArgs = {
  address: Scalars['Address']['input'];
  hash?: InputMaybe<Scalars['ByteString']['input']>;
};


export type StandaloneQueryMonsterCollectionStatusArgs = {
  address?: InputMaybe<Scalars['Address']['input']>;
};


export type StandaloneQueryNextTxNonceArgs = {
  address: Scalars['Address']['input'];
};


export type StandaloneQueryStateArgs = {
  address: Scalars['Address']['input'];
  hash?: InputMaybe<Scalars['ByteString']['input']>;
};


export type StandaloneQueryStateQueryArgs = {
  hash?: InputMaybe<Scalars['ByteString']['input']>;
};


export type StandaloneQueryTransferNcgHistoriesArgs = {
  blockHash: Scalars['ByteString']['input'];
  recipient?: InputMaybe<Scalars['Address']['input']>;
};

export type StandaloneSubscription = {
  __typename?: 'StandaloneSubscription';
  balanceByAgent: Scalars['String']['output'];
  differentAppProtocolVersionEncounter: DifferentAppProtocolVersionEncounterType;
  nodeException: NodeExceptionType;
  nodeStatus?: Maybe<NodeStatusType>;
  notification: NotificationType;
  preloadProgress?: Maybe<PreloadStateType>;
  tipChanged?: Maybe<TipChanged>;
  tx?: Maybe<TxType>;
};


export type StandaloneSubscriptionBalanceByAgentArgs = {
  address: Scalars['Address']['input'];
};


export type StandaloneSubscriptionTxArgs = {
  actionType: Scalars['String']['input'];
};

export enum StatType {
  ArmorPenetration = 'ARMOR_PENETRATION',
  Atk = 'ATK',
  Cdmg = 'CDMG',
  Cri = 'CRI',
  Def = 'DEF',
  Drr = 'DRR',
  Drv = 'DRV',
  Hit = 'HIT',
  Hp = 'HP',
  None = 'NONE',
  Spd = 'SPD',
  Thorn = 'THORN'
}

export type StateQuery = {
  __typename?: 'StateQuery';
  agent?: Maybe<AgentStateType>;
  arenaInformation: Array<ArenaInformationType>;
  arenaParticipants: Array<Maybe<ArenaParticipantType>>;
  avatar?: Maybe<AvatarStateType>;
  avatars: Array<Maybe<AvatarStateType>>;
  balance: FungibleAssetValueWithCurrencyType;
  crystalMonsterCollectionMultiplierSheet?: Maybe<CrystalMonsterCollectionMultiplierSheetType>;
  garages?: Maybe<GaragesType>;
  latestStakeRewards?: Maybe<StakeRewardsType>;
  monsterCollectionSheet?: Maybe<MonsterCollectionSheetType>;
  monsterCollectionState?: Maybe<MonsterCollectionStateType>;
  orderDigestList?: Maybe<OrderDigestListStateType>;
  pledge: MeadPledgeType;
  raidId: Scalars['Int']['output'];
  raiderList?: Maybe<Array<Scalars['Address']['output']>>;
  raiderState?: Maybe<RaiderStateType>;
  rankingMap?: Maybe<RankingMapStateType>;
  shardedShop?: Maybe<ShardedShopStateV2Type>;
  /** @deprecated Shop is migrated to ShardedShop and not using now. Use shardedShop() instead. */
  shop?: Maybe<ShopStateType>;
  /** @deprecated Since stake3, claim_stake_reward9 actions, each stakers have their own contracts. */
  stakeRewards?: Maybe<StakeRewardsType>;
  stakeState?: Maybe<StakeStateType>;
  stakeStates: Array<Maybe<StakeStateType>>;
  unlockedRecipeIds?: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
  unlockedWorldIds?: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
  weeklyArena?: Maybe<WeeklyArenaStateType>;
  worldBossKillRewardRecord?: Maybe<WorldBossKillRewardRecordType>;
  worldBossState?: Maybe<WorldBossStateType>;
};


export type StateQueryAgentArgs = {
  address: Scalars['Address']['input'];
};


export type StateQueryArenaInformationArgs = {
  avatarAddresses: Array<Scalars['Address']['input']>;
  championshipId: Scalars['Int']['input'];
  round: Scalars['Int']['input'];
};


export type StateQueryArenaParticipantsArgs = {
  avatarAddress: Scalars['Address']['input'];
  filterBounds?: Scalars['Boolean']['input'];
};


export type StateQueryAvatarArgs = {
  avatarAddress: Scalars['Address']['input'];
};


export type StateQueryAvatarsArgs = {
  addresses: Array<Scalars['Address']['input']>;
};


export type StateQueryBalanceArgs = {
  address: Scalars['Address']['input'];
  currency: CurrencyInput;
};


export type StateQueryGaragesArgs = {
  agentAddr: Scalars['Address']['input'];
  currencyEnums?: InputMaybe<Array<CurrencyEnum>>;
  currencyTickers?: InputMaybe<Array<Scalars['String']['input']>>;
  fungibleItemIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type StateQueryMonsterCollectionStateArgs = {
  agentAddress: Scalars['Address']['input'];
};


export type StateQueryOrderDigestListArgs = {
  avatarAddress: Scalars['Address']['input'];
};


export type StateQueryPledgeArgs = {
  agentAddress: Scalars['Address']['input'];
};


export type StateQueryRaidIdArgs = {
  blockIndex: Scalars['Long']['input'];
  prev?: InputMaybe<Scalars['Boolean']['input']>;
};


export type StateQueryRaiderListArgs = {
  raiderListAddress: Scalars['Address']['input'];
};


export type StateQueryRaiderStateArgs = {
  raiderAddress: Scalars['Address']['input'];
};


export type StateQueryRankingMapArgs = {
  index: Scalars['Int']['input'];
};


export type StateQueryShardedShopArgs = {
  itemSubType: ItemSubType;
  nonce: Scalars['Int']['input'];
};


export type StateQueryStakeStateArgs = {
  address: Scalars['Address']['input'];
};


export type StateQueryStakeStatesArgs = {
  addresses: Array<InputMaybe<Scalars['Address']['input']>>;
};


export type StateQueryUnlockedRecipeIdsArgs = {
  avatarAddress: Scalars['Address']['input'];
};


export type StateQueryUnlockedWorldIdsArgs = {
  avatarAddress: Scalars['Address']['input'];
};


export type StateQueryWeeklyArenaArgs = {
  index: Scalars['Int']['input'];
};


export type StateQueryWorldBossKillRewardRecordArgs = {
  worldBossKillRewardRecordAddress: Scalars['Address']['input'];
};


export type StateQueryWorldBossStateArgs = {
  bossAddress: Scalars['Address']['input'];
};

export type StatsMapType = {
  __typename?: 'StatsMapType';
  aTK: Scalars['Int']['output'];
  cRI: Scalars['Int']['output'];
  dEF: Scalars['Int']['output'];
  hIT: Scalars['Int']['output'];
  hP: Scalars['Int']['output'];
  sPD: Scalars['Int']['output'];
};

export type TipChanged = {
  __typename?: 'TipChanged';
  hash?: Maybe<Scalars['ByteString']['output']>;
  index: Scalars['Long']['output'];
};

export type Transaction = {
  __typename?: 'Transaction';
  actions: Array<Action>;
  blockRef: Block;
  id: Scalars['ID']['output'];
  nonce: Scalars['Long']['output'];
  publicKey: Scalars['ByteString']['output'];
  serializedPayload: Scalars['String']['output'];
  signature: Scalars['ByteString']['output'];
  signer: Scalars['Address']['output'];
  timestamp: Scalars['DateTimeOffset']['output'];
  updatedAddresses: Array<Scalars['Address']['output']>;
};

export type TransactionHeadlessQuery = {
  __typename?: 'TransactionHeadlessQuery';
  /** @deprecated Use signTransaction */
  attachSignature: Scalars['String']['output'];
  /** @deprecated API update with action query. use unsignedTransaction */
  createUnsignedTx: Scalars['String']['output'];
  getTx?: Maybe<TransactionType>;
  ncTransactions?: Maybe<Array<Maybe<TransactionType>>>;
  nextTxNonce: Scalars['Long']['output'];
  signTransaction: Scalars['ByteString']['output'];
  transactionResult: TxResultType;
  unsignedTransaction: Scalars['ByteString']['output'];
};


export type TransactionHeadlessQueryAttachSignatureArgs = {
  signature: Scalars['String']['input'];
  unsignedTransaction: Scalars['String']['input'];
};


export type TransactionHeadlessQueryCreateUnsignedTxArgs = {
  nonce?: InputMaybe<Scalars['Long']['input']>;
  plainValue: Scalars['String']['input'];
  publicKey: Scalars['String']['input'];
};


export type TransactionHeadlessQueryGetTxArgs = {
  txId: Scalars['TxId']['input'];
};


export type TransactionHeadlessQueryNcTransactionsArgs = {
  actionType: Scalars['String']['input'];
  limit: Scalars['Long']['input'];
  startingBlockIndex: Scalars['Long']['input'];
};


export type TransactionHeadlessQueryNextTxNonceArgs = {
  address: Scalars['Address']['input'];
};


export type TransactionHeadlessQuerySignTransactionArgs = {
  signature: Scalars['String']['input'];
  unsignedTransaction: Scalars['String']['input'];
};


export type TransactionHeadlessQueryTransactionResultArgs = {
  txId: Scalars['TxId']['input'];
};


export type TransactionHeadlessQueryUnsignedTransactionArgs = {
  maxGasPrice?: InputMaybe<FungibleAssetValueInputType>;
  nonce?: InputMaybe<Scalars['Long']['input']>;
  plainValue: Scalars['String']['input'];
  publicKey: Scalars['String']['input'];
};

export type TransactionQuery = {
  __typename?: 'TransactionQuery';
  bindSignature: Scalars['String']['output'];
  nextNonce: Scalars['Long']['output'];
  stagedTransactions: Array<Transaction>;
  transaction?: Maybe<Transaction>;
  transactionResult: TxResultType;
  transactions: Array<Transaction>;
  unsignedTransaction: Scalars['ByteString']['output'];
};


export type TransactionQueryBindSignatureArgs = {
  signature: Scalars['String']['input'];
  unsignedTransaction: Scalars['String']['input'];
};


export type TransactionQueryNextNonceArgs = {
  address: Scalars['Address']['input'];
};


export type TransactionQueryStagedTransactionsArgs = {
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  involvedAddress?: InputMaybe<Scalars['Address']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  signer?: InputMaybe<Scalars['Address']['input']>;
};


export type TransactionQueryTransactionArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type TransactionQueryTransactionResultArgs = {
  txId: Scalars['ID']['input'];
};


export type TransactionQueryTransactionsArgs = {
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  involvedAddress?: InputMaybe<Scalars['Address']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  signer?: InputMaybe<Scalars['Address']['input']>;
};


export type TransactionQueryUnsignedTransactionArgs = {
  nonce?: InputMaybe<Scalars['Long']['input']>;
  plainValue: Scalars['String']['input'];
  publicKey: Scalars['String']['input'];
};

export type TransactionType = {
  __typename?: 'TransactionType';
  actions: Array<Maybe<Action>>;
  id: Scalars['TxId']['output'];
  nonce: Scalars['Long']['output'];
  publicKey: PublicKeyType;
  serializedPayload: Scalars['String']['output'];
  signature: Scalars['ByteString']['output'];
  signer: Scalars['Address']['output'];
  timestamp: Scalars['String']['output'];
  updatedAddresses: Array<Maybe<Scalars['Address']['output']>>;
};

export type TransferNcgHistoryType = {
  __typename?: 'TransferNCGHistoryType';
  amount: Scalars['String']['output'];
  blockHash: Scalars['ByteString']['output'];
  memo?: Maybe<Scalars['String']['output']>;
  recipient: Scalars['Address']['output'];
  sender: Scalars['Address']['output'];
  txId: Scalars['ByteString']['output'];
};

export type TxResultType = {
  __typename?: 'TxResultType';
  blockHash?: Maybe<Scalars['String']['output']>;
  blockIndex?: Maybe<Scalars['Long']['output']>;
  exceptionNames?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  inputState?: Maybe<Scalars['HashDigest_SHA256']['output']>;
  outputState?: Maybe<Scalars['HashDigest_SHA256']['output']>;
  txStatus: TxStatus;
};

export enum TxStatus {
  Failure = 'FAILURE',
  Invalid = 'INVALID',
  Staging = 'STAGING',
  Success = 'SUCCESS'
}

export type TxType = {
  __typename?: 'TxType';
  transaction: TransactionType;
  txResult?: Maybe<TxResultType>;
};

export type ValidationQuery = {
  __typename?: 'ValidationQuery';
  metadata: Scalars['Boolean']['output'];
  privateKey: Scalars['Boolean']['output'];
  publicKey: Scalars['Boolean']['output'];
};


export type ValidationQueryMetadataArgs = {
  raw: Scalars['String']['input'];
};


export type ValidationQueryPrivateKeyArgs = {
  hex: Scalars['ByteString']['input'];
};


export type ValidationQueryPublicKeyArgs = {
  hex: Scalars['ByteString']['input'];
};

export type Validator = {
  __typename?: 'Validator';
  power: Scalars['BigInt']['output'];
  publicKey: Scalars['PublicKey']['output'];
};

export type Vote = {
  __typename?: 'Vote';
  blockHash: Scalars['String']['output'];
  flag: Scalars['VoteFlag']['output'];
  height: Scalars['Long']['output'];
  round: Scalars['Int']['output'];
  signature: Scalars['ByteString']['output'];
  timestamp: Scalars['DateTimeOffset']['output'];
  validatorPublicKey: Scalars['PublicKey']['output'];
};

export type WeeklyArenaStateType = {
  __typename?: 'WeeklyArenaStateType';
  address: Scalars['Address']['output'];
  ended: Scalars['Boolean']['output'];
  orderedArenaInfos: Array<Maybe<ArenaInfoType>>;
};

export type WorldBossKillRewardRecordMapType = {
  __typename?: 'WorldBossKillRewardRecordMapType';
  bossLevel: Scalars['Int']['output'];
  claimed: Scalars['Boolean']['output'];
};

export type WorldBossKillRewardRecordType = {
  __typename?: 'WorldBossKillRewardRecordType';
  map: Array<WorldBossKillRewardRecordMapType>;
};

export type WorldBossStateType = {
  __typename?: 'WorldBossStateType';
  currentHp: Scalars['BigInt']['output'];
  endedBlockIndex: Scalars['Long']['output'];
  id: Scalars['Int']['output'];
  level: Scalars['Int']['output'];
  startedBlockIndex: Scalars['Long']['output'];
};

export type WorldInformationType = {
  __typename?: 'WorldInformationType';
  isStageCleared: Scalars['Boolean']['output'];
  isWorldUnlocked: Scalars['Boolean']['output'];
  world: WorldType;
};


export type WorldInformationTypeIsStageClearedArgs = {
  stageId: Scalars['Int']['input'];
};


export type WorldInformationTypeIsWorldUnlockedArgs = {
  worldId: Scalars['Int']['input'];
};


export type WorldInformationTypeWorldArgs = {
  worldId: Scalars['Int']['input'];
};

export type WorldType = {
  __typename?: 'WorldType';
  id: Scalars['Int']['output'];
  isStageCleared: Scalars['Boolean']['output'];
  isUnlocked: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  stageBegin: Scalars['Int']['output'];
  stageClearedBlockIndex: Scalars['Long']['output'];
  stageClearedId: Scalars['Int']['output'];
  stageEnd: Scalars['Int']['output'];
  unlockedBlockIndex: Scalars['Long']['output'];
};

export type GetAssetTransferredQueryVariables = Exact<{
  blockIndex: Scalars['Long']['input'];
}>;


export type GetAssetTransferredQuery = { __typename?: 'StandaloneQuery', transaction: { __typename?: 'TransactionHeadlessQuery', ncTransactions?: Array<{ __typename?: 'TransactionType', id: any, actions: Array<{ __typename?: 'Action', raw: string } | null> } | null> | null } };

export type GetBlockHashQueryVariables = Exact<{
  hash: Scalars['ID']['input'];
}>;


export type GetBlockHashQuery = { __typename?: 'StandaloneQuery', chainQuery: { __typename?: 'ExplorerQuery', blockQuery?: { __typename?: 'BlockQuery', block?: { __typename?: 'Block', index: number } | null } | null } };

export type GetGarageUnloadsQueryVariables = Exact<{
  startingBlockIndex: Scalars['Long']['input'];
}>;


export type GetGarageUnloadsQuery = { __typename?: 'StandaloneQuery', transaction: { __typename?: 'TransactionHeadlessQuery', ncTransactions?: Array<{ __typename?: 'TransactionType', id: any, actions: Array<{ __typename?: 'Action', raw: string } | null> } | null> | null } };

export type GetNextTxNonceQueryVariables = Exact<{
  address: Scalars['Address']['input'];
}>;


export type GetNextTxNonceQuery = { __typename?: 'StandaloneQuery', nextTxNonce: number };

export type GetTipIndexQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTipIndexQuery = { __typename?: 'StandaloneQuery', nodeStatus: { __typename?: 'NodeStatusType', tip: { __typename?: 'BlockHeader', index: number } } };

export type GetTransactionResultQueryVariables = Exact<{
  txId: Scalars['TxId']['input'];
}>;


export type GetTransactionResultQuery = { __typename?: 'StandaloneQuery', transaction: { __typename?: 'TransactionHeadlessQuery', transactionResult: { __typename?: 'TxResultType', txStatus: TxStatus } } };

export type StageTransactionMutationVariables = Exact<{
  payload: Scalars['String']['input'];
}>;


export type StageTransactionMutation = { __typename?: 'StandaloneMutation', stageTransaction: any };


export const GetAssetTransferredDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAssetTransferred"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blockIndex"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ncTransactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startingBlockIndex"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blockIndex"}}},{"kind":"Argument","name":{"kind":"Name","value":"actionType"},"value":{"kind":"StringValue","value":"^transfer_asset[0-9]*$","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"actions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raw"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetAssetTransferredQuery, GetAssetTransferredQueryVariables>;
export const GetBlockHashDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBlockHash"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hash"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chainQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"hash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hash"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"index"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetBlockHashQuery, GetBlockHashQueryVariables>;
export const GetGarageUnloadsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGarageUnloads"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startingBlockIndex"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ncTransactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startingBlockIndex"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startingBlockIndex"}}},{"kind":"Argument","name":{"kind":"Name","value":"actionType"},"value":{"kind":"StringValue","value":"unload_from_my_garages*","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"actions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raw"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetGarageUnloadsQuery, GetGarageUnloadsQueryVariables>;
export const GetNextTxNonceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetNextTxNonce"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nextTxNonce"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"address"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}}]}]}}]} as unknown as DocumentNode<GetNextTxNonceQuery, GetNextTxNonceQueryVariables>;
export const GetTipIndexDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTipIndex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodeStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"index"}}]}}]}}]}}]} as unknown as DocumentNode<GetTipIndexQuery, GetTipIndexQueryVariables>;
export const GetTransactionResultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTransactionResult"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"txId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TxId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionResult"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"txId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"txId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txStatus"}}]}}]}}]}}]} as unknown as DocumentNode<GetTransactionResultQuery, GetTransactionResultQueryVariables>;
export const StageTransactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StageTransaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"payload"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stageTransaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"payload"},"value":{"kind":"Variable","name":{"kind":"Name","value":"payload"}}}]}]}}]} as unknown as DocumentNode<StageTransactionMutation, StageTransactionMutationVariables>;