import { Account, Address, RawPrivateKey } from "@planetarium/account";
import { PrismaClient } from "@prisma/client";
import { WebClient } from "@slack/web-api";
import "dotenv/config";
import { getAccountFromEnv } from "./accounts";
import { AssetBurner } from "./asset-burner";
import { AssetTransfer } from "./asset-transfer";
import { getEnv, getRequiredEnv } from "./env";
import { HeadlessGraphQLClient } from "./headless-graphql-client";
import { IHeadlessGraphQLClient } from "./interfaces/headless-graphql-client";
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
import { processDownstreamEvents } from "./sync/downstream";
import { Processor } from "./sync/processor";
import { stageTransactionFromDB } from "./sync/stage";
import { updateTxStatuses } from "./sync/txresult";
import { processUpstreamEvents } from "./sync/upstream";
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

    const upstreamAccount = getAccountFromEnv("NC_UPSTREAM");
    const downstreamAccount = getAccountFromEnv("NC_DOWNSTREAM");

    await slackBot.sendMessage(
        new AppStartEvent(
            await upstreamAccount.getAddress(),
            await downstreamAccount.getAddress(),
        ),
    );

    const agentAddress = Address.fromHex(getRequiredEnv("NC_VAULT_ADDRESS"));
    const avatarAddress = Address.fromHex(
        getRequiredEnv("NC_VAULT_AVATAR_ADDRESS"),
    );

    const useRDB = getEnv("USE_RDB");
    if (useRDB?.toLowerCase() === "true") {
        await withRDB(
            upstreamGQLClient,
            downstreamGQLClient,
            upstreamAccount,
            downstreamAccount,
            agentAddress,
            avatarAddress,
            slackBot,
        );
    } else {
        await withMonitors(
            upstreamGQLClient,
            downstreamGQLClient,
            upstreamAccount,
            downstreamAccount,
            agentAddress,
            avatarAddress,
            slackBot,
        );
    }
})().catch(async (error) => {
    console.error(error);
    await slackBot.sendMessage(new AppStopEvent(error));
    process.exit(-1);
});

async function withMonitors(
    upstreamGQLClient: IHeadlessGraphQLClient,
    downstreamGQLClient: IHeadlessGraphQLClient,
    upstreamAccount: Account,
    downstreamAccount: Account,
    agentAddress: Address,
    avatarAddress: Address,
    slackBot: SlackBot,
) {
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
            agentAddress,
        );
    const downstreamAssetsTransferredMonitorMonitor =
        new AssetsTransferredMonitor(
            getMonitorStateHandler(
                monitorStateStore,
                "downstreamAssetTransferMonitor",
            ),
            downstreamGQLClient,
            agentAddress,
        );
    const garageMonitor = new GarageUnloadMonitor(
        getMonitorStateHandler(
            monitorStateStore,
            "upstreamGarageUnloadMonitor",
        ),
        upstreamGQLClient,
        agentAddress,
        avatarAddress,
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

    garageMonitor.attach(
        new GarageObserver(slackBot, minter, {
            agentAddress,
            avatarAddress,
        }),
    );

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
}

async function withRDB(
    upstreamGQLClient: IHeadlessGraphQLClient,
    downstreamGQLClient: IHeadlessGraphQLClient,
    upstreamAccount: Account,
    downstreamAccount: Account,
    agentAddress: Address,
    avatarAddress: Address,
    slackBot: SlackBot,
) {
    const upstreamStartBlockIndex = BigInt(
        getRequiredEnv("NC_UPSTREAM__RDB__START_BLOCK_INDEX"),
    );
    const downstreamStartBlockIndex = BigInt(
        getRequiredEnv("NC_DOWNSTREAM__RDB__START_BLOCK_INDEX"),
    );

    const client = new PrismaClient();
    await client.$connect();

    await createNetworkIfNotExist(client, upstreamGQLClient);
    await createNetworkIfNotExist(client, downstreamGQLClient);

    const headlessGQLClientsMap = {
        [upstreamGQLClient.getPlanetID()]: upstreamGQLClient,
        [downstreamGQLClient.getPlanetID()]: downstreamGQLClient,
    };

    const processor = new Processor([
        async () => await updateTxStatuses(client, headlessGQLClientsMap),
        async () =>
            await processDownstreamEvents(
                upstreamAccount,
                downstreamAccount,
                client,
                upstreamGQLClient,
                downstreamGQLClient,
                agentAddress,
                downstreamStartBlockIndex,
                slackBot,
            ),
        async () =>
            await processUpstreamEvents(
                downstreamAccount,
                client,
                upstreamGQLClient,
                downstreamGQLClient,
                agentAddress,
                avatarAddress,
                upstreamStartBlockIndex,
                slackBot,
            ),
        async () =>
            await stageTransactionFromDB(
                upstreamAccount,
                client,
                upstreamGQLClient,
            ),
        async () =>
            await stageTransactionFromDB(
                downstreamAccount,
                client,
                downstreamGQLClient,
            ),
    ]);

    function makeShutdownHandler(signal: string): () => Promise<void> {
        return async () => {
            console.log(signal, "handler called.");
            await processor.stop();
            await slackBot.sendMessage(new AppStopEvent());
        };
    }

    process.on("SIGTERM", makeShutdownHandler("SIGTERM"));
    process.on("SIGINT", makeShutdownHandler("SIGINT"));

    await processor.start();
}

async function createNetworkIfNotExist(
    client: PrismaClient,
    headlessGQLClient: IHeadlessGraphQLClient,
) {
    if (
        !(await client.network.findUnique({
            where: {
                id: headlessGQLClient.getPlanetID(),
            },
        }))
    ) {
        await client.network.create({
            data: {
                id: headlessGQLClient.getPlanetID(),
            },
        });
    }
}
