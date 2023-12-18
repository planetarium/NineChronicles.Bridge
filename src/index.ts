import { Account, Address, RawPrivateKey } from "@planetarium/account";
import { PrismaClient } from "@prisma/client";
import { WebClient } from "@slack/web-api";
import "dotenv/config";
import { getAccountFromEnv } from "./accounts";
import { getEnv, getRequiredEnv } from "./env";
import { HeadlessGraphQLClient } from "./headless-graphql-client";
import { IHeadlessGraphQLClient } from "./interfaces/headless-graphql-client";
import { PreloadHandler } from "./preload-handler";
import { SlackBot } from "./slack/bot";
import { SlackChannel } from "./slack/channel";
import { AppStartEvent } from "./slack/messages/app-start-event";
import { AppStopEvent } from "./slack/messages/app-stop-event";
import { processDownstreamEvents } from "./sync/downstream";
import { Processor } from "./sync/processor";
import { stageTransactionFromDB } from "./sync/stage";
import { updateTxStatuses } from "./sync/txresult";
import { processUpstreamEvents } from "./sync/upstream";
import { Planet } from "./types/registry";

const SLACK_BOT_USERNAME = getEnv("SLACK__BOT_USERNAME");
const SLACK_CHANNEL = getEnv("SLACK__CHANNEL");
const SLACK_BOT_TOKEN = getEnv("SLACK__BOT_TOKEN");
const slackBot: SlackBot | null =
    SLACK_BOT_USERNAME !== undefined &&
    SLACK_BOT_TOKEN !== undefined &&
    SLACK_CHANNEL !== undefined
        ? new SlackBot(
              SLACK_BOT_USERNAME,
              new SlackChannel(SLACK_CHANNEL, new WebClient(SLACK_BOT_TOKEN)),
          )
        : null;

(async () => {
    const [upstreamPlanet, downstreamPlanet]: Planet[] =
        await new PreloadHandler().preparePlanets();

    const upstreamGQLClient = new HeadlessGraphQLClient(upstreamPlanet);
    const downstreamGQLClient = new HeadlessGraphQLClient(downstreamPlanet);

    const upstreamAccount = getAccountFromEnv("NC_UPSTREAM");
    const downstreamAccount = getAccountFromEnv("NC_DOWNSTREAM");

    await slackBot?.sendMessage(
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
        throw new Error("Non RDB mode execution is depreacted.");
    }
})().catch(async (error) => {
    console.error(error);
    await slackBot?.sendMessage(new AppStopEvent(error));
    process.exit(-1);
});

async function withRDB(
    upstreamGQLClient: IHeadlessGraphQLClient,
    downstreamGQLClient: IHeadlessGraphQLClient,
    upstreamAccount: Account,
    downstreamAccount: Account,
    agentAddress: Address,
    avatarAddress: Address,
    slackBot: SlackBot | null,
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

    const processor = new Processor(
        [
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
        ],
        [
            [
                5000,
                async () =>
                    await updateTxStatuses(client, headlessGQLClientsMap),
            ],
            [
                5000,
                async () =>
                    await stageTransactionFromDB(
                        upstreamAccount,
                        client,
                        upstreamGQLClient,
                    ),
            ],
            [
                5000,
                async () =>
                    await stageTransactionFromDB(
                        downstreamAccount,
                        client,
                        downstreamGQLClient,
                    ),
            ],
        ],
    );

    function makeShutdownHandler(signal: string): () => Promise<void> {
        return async () => {
            console.log(signal, "handler called.");
            await processor.stop();
            await slackBot?.sendMessage(new AppStopEvent());
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
