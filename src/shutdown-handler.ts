import { ShutdownChecker } from "./types/shutdown-checker";

export class ShutdownHandler implements ShutdownChecker {
    private _shutdown: boolean;

    constructor() {
        this._shutdown = false;
    }

    isShutdown(): boolean {
        return this._shutdown;
    }

    shutdown(): void {
        console.log("ShutdownHandler.shutdown called.");
        this._shutdown = true;
    }
}
