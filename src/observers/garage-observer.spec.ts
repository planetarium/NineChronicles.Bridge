import test, { mock } from "node:test";
import { Address, RawPrivateKey } from "@planetarium/account";
import { ChatPostMessageResponse } from "@slack/web-api";
import { HeadlessGraphQLClient } from "../headless-graphql-client";
import { Minter } from "../minter";
import { Signer } from "../signer";
import { Sqlite3MonitorStateStore } from "../sqlite3-monitor-state-store";
import { HeadlessTxPool } from "../txpool/headless";
import { GarageObserver } from "./garage-observer";

const FAKE_SLACK_MESSAGE_SENDER = {
    sendMessage() {
        return Promise.resolve({}) as Promise<ChatPostMessageResponse>;
    },
};

test("notify", async () => {
    const monitorStateStore = await Sqlite3MonitorStateStore.open("test");
    const account = RawPrivateKey.fromHex("");
    const headlessClient = new HeadlessGraphQLClient({
        id: "0x100000000000",
        rpcEndpoints: {
            "headless.gql": [
                "https://9c-internal-rpc-1.nine-chronicles.com/graphql",
            ],
            "headless.grpc": [],
        },
    });
    const signer = new Signer(
        account,
        new HeadlessTxPool(headlessClient),
        await headlessClient.getGenesisHash(),
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
    observer.notify({
        blockHash: "xxx",
        events: [
            {
                blockHash: "xxx",
                planetID: "odin",
                signer: "0x0000000000000000000000000000000000000000",
                fungibleAssetValues: [
                    [
                        await account.getAddress(),
                        {
                            currency: {
                                ticker: "CRYSTAL",
                                decimalPlaces: 18,
                                minters: null,
                                totalSupplyTrackable: false,
                                maximumSupply: null,
                            },
                            rawValue: 10n,
                        },
                    ],
                ],
                fungibleItems: [
                    [
                        await account.getAddress(),
                        "1a755098a2bc0659a063107df62e2ff9b3cdaba34d96b79519f504b996f53820",
                        100,
                    ],
                ],
                txId: "",
                parsedMemo: {
                    agentAddress: "0x019101FEec7ed4f918D396827E1277DEda1e20D4",
                    avatarAddress: "0x37fd092455B529cFAE3Bf3b58201cE029231cDBe",
                    memo: "",
                },
            },
        ],
    });
});
