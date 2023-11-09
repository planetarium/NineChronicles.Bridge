import 'dotenv/config';
import { AssetsTransferredMonitor } from './monitors/assets-transferred-monitor';
import { HeadlessGraphQLClient } from './headless-graphql-client';
import { IMonitorStateStore } from './interfaces/monitor-state-store';
import { Sqlite3MonitorStateStore } from './sqlite3-monitor-state-store';
import { AssetTransferredObserver } from './observers/asset-transferred-observer';
import { Minter } from './minter';
import { Address, RawPrivateKey } from '@planetarium/account';
import { GarageUnloadMonitor } from './monitors/garage-unload-monitor';
import { GarageObserver } from './observers/garage-observer';

(async() => {
    const upstreamGQLClient = new HeadlessGraphQLClient(
        process.env.NC_UPSTREAM_GQL_ENDPOINT,
        3
    );
    const downstreamGQLClient = new HeadlessGraphQLClient(
        process.env.NC_DOWNSTREAM_GQL_ENDPOINT,
        3
    );
    const monitorStateStore: IMonitorStateStore = await Sqlite3MonitorStateStore.open(
        process.env.MONITOR_STATE_STORE_PATH
    );
    
    const assetsTransferredMonitorMonitor = new AssetsTransferredMonitor(
        await monitorStateStore.load("nineChronicles"),
        upstreamGQLClient,
        Address.fromHex(process.env.NC_VAULT_ADDRESS)
    );
    const garageMonitor = new GarageUnloadMonitor(
        await monitorStateStore.load("nineChronicles"),
        upstreamGQLClient,
        Address.fromHex(process.env.NC_VAULT_ADDRESS),
        Address.fromHex(process.env.NC_VAULT_AVATAR_ADDRESS)
    )

    const upstreamAccount = RawPrivateKey.fromHex(
        process.env.NC_UPSTREAM_PRIVATE_KEY
    );
    const downstreamAccount = RawPrivateKey.fromHex(
        process.env.NC_DOWNSTREAM_PRIVATE_KEY
    );

    const minter = new Minter(
        downstreamAccount,
        downstreamGQLClient
    );
    
    assetsTransferredMonitorMonitor.attach(
        new AssetTransferredObserver(
            monitorStateStore, 
            minter
        )
    );

    garageMonitor.attach(new GarageObserver(monitorStateStore, minter));

    assetsTransferredMonitorMonitor.run();
    garageMonitor.run();
})().catch(error => {
    console.error(error);
    process.exit(-1);
});
