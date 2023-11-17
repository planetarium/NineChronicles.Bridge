import { IMonitorStateHandler } from "./interfaces/monitor-state-handler";
import { IMonitorStateStore } from "./interfaces/monitor-state-store";

export function getMonitorStateHandler(
    stateStore: IMonitorStateStore,
    key: string,
): IMonitorStateHandler {
    return {
        load() {
            return stateStore.load(key);
        },
        store(blockHash) {
            return stateStore.store(key, blockHash);
        },
    };
}
