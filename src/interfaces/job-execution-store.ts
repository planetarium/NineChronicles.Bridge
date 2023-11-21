import { Job, PrismaClient, ActionType } from "@prisma/client";
import { GarageUnloadEvent } from "../types/garage-unload-event";
import { IJobExecutionStore } from "./interfaces/job-execution-store";
import { AssetTransferredEvent } from "../types/asset-transferred-event";
import { TransactionLocation } from "../types/transaction-location";

export interface IJobExecutionStore {
    putAssetTransferReq(
        event: AssetTransferredEvent & TransactionLocation
    ): Promise<void>;
    putGarageUnloadReq(
        event: GarageUnloadEvent & TransactionLocation
    ): Promise<void>;
    putJobExec(reqTxId: string, resTxId: string, dstPlanet: string, actionType: ActionType);
}
