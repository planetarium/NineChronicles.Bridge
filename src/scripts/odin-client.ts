import { HeadlessGraphQLClient } from "../headless-graphql-client";

export const odinClient = new HeadlessGraphQLClient(
    {
        id: "0x000000000000",
        rpcEndpoints: {
            "headless.gql": [
                "https://9c-main-full-state.nine-chronicles.com/graphql",
            ],
            "headless.grpc": [],
        },
    },
    1,
);
