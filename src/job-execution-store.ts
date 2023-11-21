import { $Enums, PrismaClient } from "@prisma/client";
import { IJobExecutionStore } from "./interfaces/job-execution-store";
import { AssetTransferredEvent } from "./types/asset-transferred-event";
import { GarageUnloadEvent } from "./types/garage-unload-event";
import { TransactionLocation } from "./types/transaction-location";

export class JobExecutionStore implements IJobExecutionStore {
    private _prisma: PrismaClient;

    constructor() {
        this._prisma = new PrismaClient();
    }
    async putAssetTransferReq(
        event: AssetTransferredEvent & TransactionLocation,
    ) {
        await this._prisma.request.create({
            data: {
                req_tx_id: event.txId,
                src_planet: event.planetID,
                req_type: "TRANSFER_ASSETS",
                timestamp: new Date(event.timestamp),
                transfer: {
                    create: {
                        sender: event.sender.toString(),
                        recipient: event.memo,
                        ticker: "NCG", //...need to be adjusted in case of non-NCG bridging?
                        amount: event.amount.rawValue.toString(),
                    },
                },
                job: {
                    create: {
                        startedAt: new Date(event.timestamp),
                    },
                },
            },
        });
    }
    async putGarageUnloadReq(event: GarageUnloadEvent & TransactionLocation) {
        const parsed = JSON.parse(event.memo);

        await this._prisma.request.create({
            data: {
                req_tx_id: event.txId,
                src_planet: event.planetID,
                req_type: "UNLOAD_GARAGE",
                timestamp: new Date(event.timestamp),
                garage: {
                    create: {
                        sender: event.signer,
                        recipient: parsed[0],
                        recipientAvatar: parsed[1],
                        FungibleAssetValues: JSON.stringify(
                            event.fungibleAssetValues,
                        ),
                        FungibleItems: JSON.stringify(event.fungibleItems),
                    },
                },
                job: {
                    create: {
                        startedAt: new Date(event.timestamp),
                    },
                },
            },
        });
    }
    async putJobExec(
        reqTxId: string,
        resTxId: string,
        dstPlanet: string,
        actionType: $Enums.ActionType,
    ) {
        await this._prisma.jobExecution.create({
            data: {
                jobId: reqTxId,
                dstPlanetId: dstPlanet,
                transactionId: resTxId,
                actionType: actionType,
            },
        });
    }
}
