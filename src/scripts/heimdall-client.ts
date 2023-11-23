import { HeadlessGraphQLClient } from "../headless-graphql-client";

export const heimdallClient = new HeadlessGraphQLClient(
    {
        id: "0x000000000001",
        rpcEndpoints: {
            "headless.gql": [
                "https://heimdall-full-state.nine-chronicles.com/graphql",
            ],
            "headless.grpc": [],
        },
    },
    20,
);
