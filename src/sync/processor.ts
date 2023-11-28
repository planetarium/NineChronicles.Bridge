export class Processor {
    private running: boolean;

    constructor(private readonly tasks: (() => Promise<void>)[]) {}

    async start(): Promise<void> {
        let cur = 0;
        while (this.running) {
            await this.tasks[cur]();
            cur = (cur + 1) % this.tasks.length;
        }

        console.debug("Processor.start() loop ended");
    }

    async stop(): Promise<void> {
        console.debug("Processor.stop() called");
        this.running = false;
    }
}
