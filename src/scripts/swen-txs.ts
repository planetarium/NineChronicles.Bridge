import { Address } from "@planetarium/account";
import { HeadlessGraphQLClient } from "../headless-graphql-client";

const odinClient = new HeadlessGraphQLClient(
    {
        id: "",
        rpcEndpoints: {
            "headless.gql": [
                "https://9c-main-full-state.nine-chronicles.com/graphql",
            ],
            "headless.grpc": [],
        },
    },
    1,
);

const blocks = new Set([
    8403626, 8403625, 8403606, 8403573, 8403529, 8403513, 8403490, 8403485,
    8403473, 8403430, 8403397, 8403393, 8403365, 8403285, 8403277, 8403249,
    8403249, 8403238, 8403205, 8403204, 8403204, 8403204, 8403165, 8403129,
    8403093,
]);

async function main() {
    const txIds = [];
    for (const b of blocks) {
        const events = await odinClient.getGarageUnloadEvents(
            b,
            Address.fromHex("0x1c2ae97380CFB4F732049e454F6D9A25D4967c6f", true),
            Address.fromHex("0x41aEFE4cdDFb57C9dFfd490e17e571705c593dDc", true),
        );

        for (const ev of events) {
            txIds.push(ev.txId);
        }
    }

    console.log(txIds);
}

main();
