import { delay } from "../utils/delay";

type Task = () => Promise<void>;

export class Processor {
    private running: boolean;

    constructor(
        private readonly tasks: Task[],
        private readonly intervalTasks: [number, Task][],
    ) {
        this.running = false;
    }

    async start(): Promise<void> {
        this.running = true;

        const timeouts: NodeJS.Timeout[] = [];
        for (const [intervalMs, task] of this.intervalTasks) {
            timeouts.push(setInterval(task, intervalMs));
        }

        let cur = 0;
        while (this.running) {
            await this.tasks[cur]();
            cur = (cur + 1) % this.tasks.length;
        }

        for (const timeout of timeouts) {
            clearInterval(timeout);
        }

        console.debug("Processor.start() loop ended");
    }

    async stop(): Promise<void> {
        console.debug("Processor.stop() called");
        this.running = false;
    }
}
