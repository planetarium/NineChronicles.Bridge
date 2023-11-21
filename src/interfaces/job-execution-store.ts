import { ActionType, Job, PrismaClient } from "@prisma/client";
import { AssetTransferredEvent } from "../types/asset-transferred-event";
import { GarageUnloadEvent } from "../types/garage-unload-event";
import { TransactionLocation } from "../types/transaction-location";
import { IJobExecutionStore } from "./interfaces/job-execution-store";

export interface IJobExecutionStore {
    putAssetTransferReq(
        event: AssetTransferredEvent & TransactionLocation,
    ): Promise<void>;
    putGarageUnloadReq(
        event: GarageUnloadEvent & TransactionLocation,
    ): Promise<void>;
    putJobExec(
        reqTxId: string,
        resTxId: string,
        dstPlanet: string,
        actionType: ActionType,
    );
}
