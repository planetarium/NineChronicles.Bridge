import test from "node:test";
import { Address, RawPrivateKey } from "@planetarium/account";
import { ChatPostMessageResponse } from "@slack/web-api";
import { HeadlessGraphQLClient } from "./headless-graphql-client";
import { Minter } from "./minter";
import { AssetTransferredObserver } from "./observers/asset-transferred-observer";
import { GarageObserver } from "./observers/garage-observer";
import { Signer } from "./signer";
import { Sqlite3MonitorStateStore } from "./sqlite3-monitor-state-store";
import { HeadlessTxPool } from "./txpool/headless";

const FAKE_SLACK_MESSAGE_SENDER = {
    sendMessage() {
        return Promise.resolve({}) as Promise<ChatPostMessageResponse>;
    },
};

const odinClient = new HeadlessGraphQLClient({
    id: "0x100000000000",
    rpcEndpoints: {
        "headless.gql": [
            "https://9c-internal-rpc-1.nine-chronicles.com/graphql",
        ],
        "headless.grpc": [],
    },
});
const heimdallClient = new HeadlessGraphQLClient({
    id: "0x100000000001",
    rpcEndpoints: {
        "headless.gql": [
            "https://heimdall-internal-rpc-1.nine-chronicles.com/graphql",
        ],
        "headless.grpc": [],
    },
});

test(".getGarageUnloadEvents()", async () => {
    const x = await odinClient.getGarageUnloadEvents(
        8286963,
        Address.fromHex("0x9b9566db35d5eff2f0b0758c5ac4c354debaf118", true),
        Address.fromHex("0xeFE0bB583257C5C3c5650Bef70d135d4aD0E9b73", true),
    );
    const monitorStateStore = await Sqlite3MonitorStateStore.open("test");
    const account = RawPrivateKey.fromHex("");
    const signer = new Signer(
        account,
        new HeadlessTxPool(heimdallClient),
        await heimdallClient.getGenesisHash(),
    );
    const minter = new Minter(signer);
    const observer = new GarageObserver(FAKE_SLACK_MESSAGE_SENDER, minter, {
        agentAddress: Address.fromHex(
            "0x1c2ae97380CFB4F732049e454F6D9A25D4967c6f",
        ),
        avatarAddress: Address.fromHex(
            "0x41aEFE4cdDFb57C9dFfd490e17e571705c593dDc",
        ),
    });
    await observer.notify({
        blockHash: "",
        events: x.map((ev) => {
            return {
                ...ev,
                blockHash: "",
                planetID: "",
                parsedMemo: {
                    agentAddress: "FIXME",
                    avatarAddress: "FIXME",
                    memo: "",
                },
            };
        }),
    });

    return;
});

test("getAssetTransferredEvents()", async () => {
    const evs = await odinClient.getAssetTransferredEvents(
        8277202,
        Address.fromHex("0x9b9566db35d5eff2f0b0758c5ac4c354debaf118", true),
    );

    const account = RawPrivateKey.fromHex("");
    const signer = new Signer(
        account,
        new HeadlessTxPool(heimdallClient),
        await heimdallClient.getGenesisHash(),
    );
    const minter = new Minter(signer);
    const stateStore = await Sqlite3MonitorStateStore.open("test");
    const observer = new AssetTransferredObserver(
        FAKE_SLACK_MESSAGE_SENDER,
        minter,
    );
    await observer.notify({
        blockHash: "",
        events: evs.map((ev) => {
            return { ...ev, blockHash: "", planetID: "" };
        }),
    });

    return;
});
