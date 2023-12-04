import { delay } from "../utils/delay";

export class Processor {
    private running: boolean;

    constructor(private readonly tasks: (() => Promise<void>)[]) {}

    async start(): Promise<void> {
        this.running = true;

        let cur = 0;
        while (this.running) {
            await this.tasks[cur]();
            cur = (cur + 1) % this.tasks.length;

            try {
                await delay(1000);
            } catch {
                console.error(
                    "Ignore errors from calling delay() in Processor.start()",
                );
            }
        }

        console.debug("Processor.start() loop ended");
    }

    async stop(): Promise<void> {
        console.debug("Processor.stop() called");
        this.running = false;
    }
}
