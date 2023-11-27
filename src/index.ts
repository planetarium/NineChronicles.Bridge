import { Address, RawPrivateKey } from "@planetarium/account";
import { WebClient } from "@slack/web-api";
import "dotenv/config";
import { getAccountFromEnv } from "./accounts";
import { AssetBurner } from "./asset-burner";
import { AssetTransfer } from "./asset-transfer";
import { getRequiredEnv } from "./env";
import { HeadlessGraphQLClient } from "./headless-graphql-client";
import { IMonitorStateStore } from "./interfaces/monitor-state-store";
import { isBackgroundSyncTxpool } from "./interfaces/txpool";
import { Minter } from "./minter";
import { getMonitorStateHandler } from "./monitor-state-handler";
import { AssetsTransferredMonitor } from "./monitors/assets-transferred-monitor";
import { GarageUnloadMonitor } from "./monitors/garage-unload-monitor";
import { AssetDownstreamObserver } from "./observers/asset-downstream-observer";
import { AssetTransferredObserver } from "./observers/asset-transferred-observer";
import { GarageObserver } from "./observers/garage-observer";
import { PreloadHandler } from "./preload-handler";
import { Signer } from "./signer";
import { SlackBot } from "./slack/bot";
import { SlackChannel } from "./slack/channel";
import { AppStartEvent } from "./slack/messages/app-start-event";
import { AppStopEvent } from "./slack/messages/app-stop-event";
import { Sqlite3MonitorStateStore } from "./sqlite3-monitor-state-store";
import { getTxpoolFromEnv } from "./txpool";
import { Planet } from "./types/registry";

const slackBot = new SlackBot(
    getRequiredEnv("SLACK__BOT_USERNAME"),
    new SlackChannel(
        getRequiredEnv("SLACK__CHANNEL"),
        new WebClient(getRequiredEnv("SLACK__BOT_TOKEN")),
    ),
);

(async () => {
    const [upstreamPlanet, downstreamPlanet]: Planet[] =
        await new PreloadHandler().preparePlanets();

    const upstreamGQLClient = new HeadlessGraphQLClient(upstreamPlanet);
    const downstreamGQLClient = new HeadlessGraphQLClient(downstreamPlanet);

    const monitorStateStore: IMonitorStateStore =
        await Sqlite3MonitorStateStore.open(
            getRequiredEnv("MONITOR_STATE_STORE_PATH"),
        );

    const upstreamAssetsTransferredMonitorMonitor =
        new AssetsTransferredMonitor(
            getMonitorStateHandler(
                monitorStateStore,
                "upstreamAssetTransferMonitor",
            ),
            upstreamGQLClient,
            Address.fromHex(getRequiredEnv("NC_VAULT_ADDRESS")),
        );
    const downstreamAssetsTransferredMonitorMonitor =
        new AssetsTransferredMonitor(
            getMonitorStateHandler(
                monitorStateStore,
                "downstreamAssetTransferMonitor",
            ),
            downstreamGQLClient,
            Address.fromHex(getRequiredEnv("NC_VAULT_ADDRESS")),
        );
    const garageMonitor = new GarageUnloadMonitor(
        getMonitorStateHandler(
            monitorStateStore,
            "upstreamGarageUnloadMonitor",
        ),
        upstreamGQLClient,
        Address.fromHex(getRequiredEnv("NC_VAULT_ADDRESS")),
        Address.fromHex(getRequiredEnv("NC_VAULT_AVATAR_ADDRESS")),
    );

    const upstreamAccount = getAccountFromEnv("NC_UPSTREAM");
    const downstreamAccount = getAccountFromEnv("NC_DOWNSTREAM");

    await slackBot.sendMessage(
        new AppStartEvent(
            await upstreamAccount.getAddress(),
            await downstreamAccount.getAddress(),
        ),
    );

    const upstreamGenesisBlockHash = await upstreamGQLClient.getGenesisHash();
    const downstreamGenesisBlockHash =
        await downstreamGQLClient.getGenesisHash();

    const upstreamTxpool = getTxpoolFromEnv("NC_UPSTREAM", upstreamGQLClient);
    const downstreamTxpool = getTxpoolFromEnv(
        "NC_DOWNSTREAM",
        downstreamGQLClient,
    );

    const upstreamSigner = new Signer(
        upstreamAccount,
        upstreamTxpool,
        upstreamGenesisBlockHash,
    );
    const downstreamSigner = new Signer(
        downstreamAccount,
        downstreamTxpool,
        downstreamGenesisBlockHash,
    );

    const minter = new Minter(downstreamSigner);

    const upstreamTransfer = new AssetTransfer(upstreamSigner);
    const downstreamBurner = new AssetBurner(downstreamSigner);

    upstreamAssetsTransferredMonitorMonitor.attach(
        new AssetTransferredObserver(slackBot, minter),
    );

    downstreamAssetsTransferredMonitorMonitor.attach(
        new AssetDownstreamObserver(
            slackBot,
            upstreamTransfer,
            downstreamBurner,
        ),
    );

    garageMonitor.attach(new GarageObserver(slackBot, minter));

    const handleSignal = () => {
        console.log("Handle signal.");

        upstreamAssetsTransferredMonitorMonitor.stop();
        downstreamAssetsTransferredMonitorMonitor.stop();
        garageMonitor.stop();

        if (isBackgroundSyncTxpool(upstreamTxpool)) {
            upstreamTxpool.stop();
        }

        if (isBackgroundSyncTxpool(downstreamTxpool)) {
            downstreamTxpool.stop();
        }

        slackBot.sendMessage(new AppStopEvent());
    };

    process.on("SIGTERM", handleSignal);
    process.on("SIGINT", handleSignal);

    upstreamAssetsTransferredMonitorMonitor.run();
    downstreamAssetsTransferredMonitorMonitor.run();
    garageMonitor.run();

    if (isBackgroundSyncTxpool(upstreamTxpool)) {
        upstreamTxpool.start();
    }

    if (isBackgroundSyncTxpool(downstreamTxpool)) {
        downstreamTxpool.start();
    }
})().catch(async (error) => {
    console.error(error);
    await slackBot.sendMessage(new AppStopEvent(error));
    process.exit(-1);
});
