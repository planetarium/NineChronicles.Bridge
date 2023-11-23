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

const SKIP_TXIDS = [
    // Prcoessed by swen 20231122
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

    // Processed by me 20231122
    "2d7c723abba4123a49afdbc0bfa6e65fb9305710cec825e8757d894d97161751",
    "10580018ad0c975fa783a87e3ca7cbb654463df628f8c148e3e71f4c10f0f7e7",
    "1c6adedaa6d7851dc2e67021ad66470b8d22cd8b51ed0daea653cb27c91673ad",
    "496b00854a49b785ca8a276c33309c4085ab7a74d972fc7e124453def29c85ea",
    "9457dcd8496ca17644041503107e0d952d3279475d5cc22a5709db7ebdc5706e",
    "beade5b2b160ac4460d66aa38c39f8662a21c0c90d09a8a62751422cf882e5af",
    "21644d1e847fd060ddbcc9495a993fc6b763015946eb471fb4d93732e22f9889",
    "5998c41a51ed8b7caefdb22c93962800b97abf881c1c32890317b65d36d41f79",
    "655a3281f5943d146f709657343cb586036db254f7d477af2270454a5e57d22b",
    "3a01cd383b60271c63883d95e0da25d3bdeb715cd74f4c552643023d157dafa2",
    "d185f67003f5895f841d8065d944a91c4ef091910eef6b01544a190b7a8e268c",
    "7b97689bf270af67d51044376335c4f6a9c6511c646c452e324bfb42b6db03b2",
    "b076e5e46015a07880cecb9e1e8ba02d36b53401ff239383b9c4908ff7000e88",
    "c659b79623a123938c5301826a488ca445cd04ec5043cd8bfc8029b3aab83193",
    "5fc8bb5bbff444651890125d0e4ab060ede91de727cbe1d2cb0dfa37d1d55708",
    "31cb432b17ae0d858e451bf4bdf87f52e7415c5d474cc7ceffd562ce2f6979db",
    "ddffc723f8a4dbb23d17d87a98d62d9e9c473e748e5523b4dbc53ee7c97883d6",

    // Processed by me. 20231123
    "f1e9745c350c38b379b3c95860daa9c3617fac1fc1e7d45dec6088c9de637168",
    "60d7eb4698ae335f6831897b9073f6291c239e8902fd1000f83ed6f12edfec6f",
    "735b351a27fb5136b17ac1c43ce8d3d5f5e2e2f8d99a505452ce520a20458fb3",
    "a5d96bf45ce87fa9a573c83368293bbcba447853aed5c476a69794c5eccedb25",
    "1d03bd80e8d1580c3173a7a970bab407b3649ad1d5a000550f14438a4638f440",
    "a3ea8a5b4c12cacd73ffffffd3351fa62fd417867a1f692dc217925eea9a23ee",
    "b59a8c3b2c69de272d947d8a3e685754d4bae6c012026911042735bbf269d39e",
    "b258c1fec2b7dfb3af0035dc9443c04d172bd19efebeaf9a449b07e4d16de60e",
    "485c51f15d8647bce7465bc42b89e05862e4a3c5baeab61b5ef2ef82c4f9d5f2",
    "8e68120a864d9cd13aff152909730c10bdf032122dd3c3f95a80d012ab049695",
    "575e0f6197ec2060b3d2ec3360e9926679f4137ca8d2d15339aba9efb375023c",
    "14ca950575fb86c86f92e223b8d2b1569706d5cb681e8a809976b9619060e7b2",
    "5311cdfa3238d3a059e923c1f0d26275154844b0543d4d1db5e1a8ddcc160674",
    "e201a25d0e08e04d8bb04e059218cf349a231f8b194d358abc0e27b85db697ed",
    "287e415f119123c1cc5ae49dbc4292cafa68c63c8765d50dadf5a029b7893a3d",
    "6f77122f9ed907c25bc43c81046d16bfe41e3b4464fb4cc5de9389f678caca13",

    // Processed by me. 20231123-02
    "e7b26c8e9cd6016a30b8e51e8fc46bc3f9045121fdafc52d6a6a4324ed1c3885",
    "68b4cd83954cc3ae30f11ba3a29097ab6175ed281face9563b13af73128abaf4",
    "e5adb2659de377e6b284c351cc4e748f2e9a1ae4a7e3681d87e030028a5db4a5",
    "b59c716bbb88e612a6a57bd8c599e1426dc028f48c141ae4e0f5b63ea555375e",
    "7de2b49caea8d85921bc53b3415a4c040988e6c26495d325408ea5ba14d46708",
    "3d8f7780a774f7e9fe1a892329c0ca5513758a13142d37bee7a61e363a4ded95",

    // Processed by me. 20231123-03
    "1c6bcf14a24159d7eb05a9c2cb3e352a84248eed765b28341fd8e155c6dd23f1",
    "4f31c27f49888df7b5fd0cfa3b47288370a9ba63b17a296d63dfc0c667780c90",
    "2ac47bf661efa49cf4144bc12b09ccdaca9cea1d906c2430568b4b316510375a",
    "02ada6b2186a2c40cbdf68419530213c6a66cb3ea9ecf102d5df20ae542d74d8",
    "2698bbb90c878dc93d2a49e7638af53e9f6a4c219fc7f8527a0d3bd7c7e376f2",
    "7840dfaa28e1cc266f2a087a672940e6bfc03a487d9526c7e72dc118c7458271",
    "3146df3935b04f50c5aa859ccf8e5689bf14decf867aa866d36e6c011cb7d564",
    "93617b3fdc829fd89843779afef564fe9b9effd18274b4ca16b9d4b934016d5f",
    "47a2f7c1be532372260df2ce1f3b89417ad04133b7bcc7f17fe693c05268f110",
    "e2035a224ceb45c05e557569de69dbcf922704f2309069a94e9ce1d91b566072",
    "fa92a15ff10627f8bcfc891908dfe21ebaa12b1b36bc489f65f1457ece952086",
    "8eac4e1f167f8305651f19defc1ec90de963a8b2b0553069542f442f5dd00520",
    "46af10052dac08d60746cd269a2efd23bac127fa92330bc49bdffe5dd7af3923",
    "42d8fdea681a0e3de941ed41d8a2cc09fc261a4c9cf61dabebc136b871163c58",
    "07979ee1bd95d18deaa8a515e12dacb8281512d9c792eb89461ffb4f61289ec2",
    "3d40932285ba8dbaf503aba3dae86e3932c7656f8bb3cf40a29d9558662acd35",
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
    console.log(SKIP_TXIDS.length);
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
            await assetObserver.notify({
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
            await garageObserver.notify({
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
