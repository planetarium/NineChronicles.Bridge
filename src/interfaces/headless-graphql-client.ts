import { Address } from "@planetarium/account";
import { AssetTransferredEvent } from "../types/asset-transferred-event";
import { BlockHash } from "../types/block-hash";
import { GarageUnloadEvent } from "../types/garage-unload-event";
import { TransactionResult } from "../types/transaction-result";
import { TxId } from "../types/txid";

export interface IHeadlessGraphQLClient {
  getBlockIndex(blockHash: BlockHash): Promise<number>;
  getTipIndex(): Promise<number>;
  getBlockHash(index: number): Promise<BlockHash>;
  getGarageUnloadEvents(
    blockIndex: number,
    agentAddress: Address,
    avatarAddress: Address,
  ): Promise<GarageUnloadEvent[]>;
  getAssetTransferredEvents(
    blockIndex: number,
    recipient: Address,
  ): Promise<AssetTransferredEvent[]>;
  getNextTxNonce(address: string): Promise<number>;
  getGenesisHash(): Promise<string>;
  stageTransaction(payload: string): Promise<string>;
  getTransactionResult(txId: TxId): Promise<TransactionResult>;
}
