import { Address, RawPrivateKey } from "@planetarium/account";
import { WebClient } from "@slack/web-api";
import "dotenv/config";
import { getAccountFromEnv } from "./accounts";
import { AssetBurner } from "./asset-burner";
import { AssetTransfer } from "./asset-transfer";
import { getRequiredEnv } from "./env";
import { HeadlessGraphQLClient } from "./headless-graphql-client";
import { IJobExecutionStore } from "./interfaces/job-execution-store";
import { IMonitorStateStore } from "./interfaces/monitor-state-store";
import { JobExecutionStore } from "./job-execution-store";
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
import { Planet } from "./types/registry";

(async () => {
    const [upstreamPlanet, downstreamPlanet]: Planet[] =
        await new PreloadHandler().preparePlanets();

    const upstreamGQLClient = new HeadlessGraphQLClient(upstreamPlanet, 6);
    const downstreamGQLClient = new HeadlessGraphQLClient(downstreamPlanet, 6);
    const monitorStateStore: IMonitorStateStore =
        await Sqlite3MonitorStateStore.open(
            getRequiredEnv("MONITOR_STATE_STORE_PATH"),
        );
    const jobExecutionStore: IJobExecutionStore = new JobExecutionStore();

    const upstreamAssetsTransferredMonitorMonitor =
        new AssetsTransferredMonitor(
            getMonitorStateHandler(
                monitorStateStore,
                "upstreamAssetTransferMonitor",
            ),
            jobExecutionStore,
            upstreamGQLClient,
            Address.fromHex(getRequiredEnv("NC_VAULT_ADDRESS")),
        );
    const downstreamAssetsTransferredMonitorMonitor =
        new AssetsTransferredMonitor(
            getMonitorStateHandler(
                monitorStateStore,
                "downstreamAssetTransferMonitor",
            ),
            jobExecutionStore,
            downstreamGQLClient,
            Address.fromHex(getRequiredEnv("NC_VAULT_ADDRESS")),
        );
    const garageMonitor = new GarageUnloadMonitor(
        getMonitorStateHandler(
            monitorStateStore,
            "upstreamGarageUnloadMonitor",
        ),
        jobExecutionStore,
        upstreamGQLClient,
        Address.fromHex(getRequiredEnv("NC_VAULT_ADDRESS")),
        Address.fromHex(getRequiredEnv("NC_VAULT_AVATAR_ADDRESS")),
    );

    const upstreamAccount = getAccountFromEnv("NC_UPSTREAM");
    const downstreamAccount = getAccountFromEnv("NC_DOWNSTREAM");

    const upstreamSigner = new Signer(upstreamAccount, upstreamGQLClient);
    const downstreamSigner = new Signer(downstreamAccount, downstreamGQLClient);

    const minter = new Minter(downstreamSigner);

    const upstreamTransfer = new AssetTransfer(upstreamSigner);
    const downstreamBurner = new AssetBurner(downstreamSigner);

    upstreamAssetsTransferredMonitorMonitor.attach(
        new AssetTransferredObserver(jobExecutionStore, minter),
    );

    downstreamAssetsTransferredMonitorMonitor.attach(
        new AssetDownstreamObserver(
            jobExecutionStore,
            upstreamTransfer,
            downstreamBurner,
        ),
    );

    const slackBot = new SlackBot(
        getRequiredEnv("SLACK__BOT_USERNAME"),
        new SlackChannel(
            getRequiredEnv("SLACK__CHANNEL"),
            new WebClient(getRequiredEnv("SLACK__BOT_TOKEN")),
        ),
    );

    await slackBot.sendMessage(
        new AppStartEvent(
            await upstreamAccount.getAddress(),
            await downstreamAccount.getAddress(),
        ),
    );
    
    garageMonitor.attach(new GarageObserver(jobExecutionStore, minter));

    const handleSignal = () => {
        console.log("Handle signal.");

        upstreamAssetsTransferredMonitorMonitor.stop();
        downstreamAssetsTransferredMonitorMonitor.stop();
        garageMonitor.stop();

        slackBot.sendMessage(new AppStopEvent());
    };

    process.on("SIGTERM", handleSignal);
    process.on("SIGINT", handleSignal);

    upstreamAssetsTransferredMonitorMonitor.run();
    downstreamAssetsTransferredMonitorMonitor.run();
    garageMonitor.run();
})().catch((error) => {
    console.error(error);
    process.exit(-1);
});
