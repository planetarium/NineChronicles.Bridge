import "dotenv/config";

import { Address, RawPrivateKey } from "@planetarium/account";
import { ChatPostMessageResponse } from "@slack/web-api";
import { getRequiredEnv } from "../env";
import { Minter } from "../minter";
import { AssetTransferredObserver } from "../observers/asset-transferred-observer";
import { GarageObserver } from "../observers/garage-observer";
import { Signer } from "../signer";
import { heimdallClient } from "./heimdall-client";
import { odinClient } from "./odin-client";
import { createDb, getAll } from "./utils";

// Prcoessed by swen
const SKIP_TXIDS = [
    "57b66182f350c2793cd855819bba6b08e417033cdf7d95372401c87044f5ec94",
    "b8404fe8ff308ce8743ae7748f814ac18aeef592599f5e93c9969ab2e21a28f5",
    "9011cb2b21ec01d2c9fa6ea86cea87da2d05f626cf23a5f675f4c1a029caa3a2",
    "1383cdc4efefb911a6748c9cec5de3995a75cb7f01c95f3ec2a0296957f54099",
    "c080d94dfa0d945a4019fcfc9032815e6495994082ec78a56651695fbd070aee",
    "a0d5a3de6aa6b5ec19fe529749b27d74b2029b803e2effad13e72e57ba2563ff",
    "fcb70ca8609590702f2f6ed87e66d7b321b0d51cc76f9f1eb73b1ee570a8f81a",
    "d837fba62e4ce0edbb26b1ee2d57d3e1604598279bc1b66319d3d9d2ca43c63c",
    "d07eeefa68d004ea4b1686f84cb05110968984b75ba74430c8f10990ac5890b6",
    "c03bc016233cf31108595fd4f999274fcc2576adddd0bb109653484b42c884bb",
    "85fcf6290d0cccdda2d971b1361e79adfaa0231e30d3bf866a8573abce21e013",
    "6e20c1124614c696cf2a5663ca419f7ad2b4103c250fef2bcff275c9108064a7",
    "e183c42f9723f4080a4c40f8f8e84bf4910e6519f74e7d356d3b233b3595fdb6",
    "41c2b704d917974925fa2bc647b79fe43df90b9b2dca14e46f8222ad988f7fbf",
    "93952992192a2a76eebb4a640c34e1bdd064adb9ab2987e1678ff15e95f58290",
    "37770058fda7fa41d2f5211ad69c712a38ebd37c57f545c93208c628fa8e6224",
    "f01c6a47060dc0eeafa2d58793ae46ee768dcf8afe7cf41bb0950c6ea90f800d",
    "812e5fac83a05be8e9cb83dd50fe16e20974551f9d5fe38bc928ffdb56b893ca",
    "3b70d425e6948240a502105a0b337916fd7744e7ec463dabe7abd7bdc81ae610",
    "453a30f209df083b82b53ad704e8f50ce19c2814041e949dce4f442fb02adfb6",
    "5c92f2e984b2d98ecae027306aec118b347254458ae08054e434e15925a74439",
    "637177ad5c2550a5b22f93a7cf0949b203f484b0c0e91a7acc5cc9dd0337e091",
    "15034853f3f5700e4d16c2476ef2acb1bf7513cbc84ddbf611aca44bd3722ebe",
    "18387a08ceec8fbbe3ea47dc99ae932fa900aeb5a16ebd559f0ec8b7246d7f67",
    "dcee52053275fd4eff694f90618419a2644898767fe84529a3c3a7e383da33ba",

    "2003e9698cb5bbb3a155e4449cbdafddd5b4546f1211025124275ecbaba22937", // MISSED, HEIMDALL's txs, it was success.
].map((x) => x.toLowerCase());

const MINTER_ACCOUNT = RawPrivateKey.fromHex(
    getRequiredEnv("MINTER_PRIVATE_KEY"),
);

const FAKE_SLACK_MESSAGE_SENDER = {
    sendMessage() {
        return Promise.resolve({}) as Promise<ChatPostMessageResponse>;
    },
};

async function main() {
    const db = await createDb("/tmp/bridge-db");

    const txs = (await getAll(
        db,
        "SELECT requestTxId, responseTxId FROM txs WHERE responseTxStatus = 'INVALID'",
    )) as {
        requestTxId: string;
        responseTxId: string;
    }[];

    const filteredTxs = txs.filter(
        (tx) => !SKIP_TXIDS.includes(tx.requestTxId.toLowerCase()),
    );
    const filteredRequestTxIds = filteredTxs.map((x) => x.requestTxId);
    console.log(filteredTxs.length, filteredRequestTxIds);

    const blockIndexes = new Set<number>();

    for (const tx of filteredTxs) {
        const txResult = await odinClient.getTransactionResult(tx.requestTxId);
        console.log(txResult, tx.requestTxId, tx.responseTxId);
        const { blockIndex } = txResult;
        blockIndexes.add(blockIndex);
    }

    console.log(blockIndexes);

    const signer = new Signer(MINTER_ACCOUNT, heimdallClient);
    const minter = new Minter(signer);
    const assetObserver = new AssetTransferredObserver(
        FAKE_SLACK_MESSAGE_SENDER,
        minter,
    );
    const garageObserver = new GarageObserver(
        FAKE_SLACK_MESSAGE_SENDER,
        minter,
    );

    const agentAddress = Address.fromHex(
        "0x1c2ae97380CFB4F732049e454F6D9A25D4967c6f",
    );
    const avatarAddress = Address.fromHex(
        "0x41aEFE4cdDFb57C9dFfd490e17e571705c593dDc",
    );
    for (const blockIndex of blockIndexes) {
        const assetEvents = await odinClient.getAssetTransferredEvents(
            blockIndex,
            agentAddress,
        );
        const garageEvents = await odinClient.getGarageUnloadEvents(
            blockIndex,
            agentAddress,
            avatarAddress,
        );

        const filteredAssetEvents = assetEvents.filter((x) =>
            filteredRequestTxIds.includes(x.txId),
        );
        const filteredGarageEvents = garageEvents.filter((x) =>
            filteredRequestTxIds.includes(x.txId),
        );
        console.log(blockIndex, filteredAssetEvents, filteredGarageEvents);

        for (const assetEvent of filteredAssetEvents) {
            assetObserver.notify({
                blockHash: "",
                events: [
                    {
                        ...assetEvent,
                        blockHash: "",
                        planetID: "0x000000000000",
                    },
                ],
            });
        }

        for (const garageEvent of filteredGarageEvents) {
            garageObserver.notify({
                blockHash: "",
                events: [
                    {
                        ...garageEvent,
                        blockHash: "",
                        planetID: "0x000000000000",
                    },
                ],
            });
        }
    }
}

main();
