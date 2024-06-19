import {
  Job,
  Processor,
  QueueScheduler,
  QueueSchedulerOptions,
  Worker,
  WorkerOptions,
} from "@/deps.ts";
import { KernelInterface, TransportInterface } from "@/ilos/common/index.ts";
import {
  RedisConnection,
  RedisInterface,
} from "@/ilos/connection-redis/index.ts";
import { QueueExtension } from "@/ilos/queue/index.ts";

interface WorkerWithScheduler {
  worker: Worker;
  scheduler: QueueScheduler;
}

/**
 * Queue Transport
 * @export
 * @class QueueTransport
 * @implements {TransportInterface}
 */
export class QueueTransport
  implements TransportInterface<WorkerWithScheduler[]> {
  queues: WorkerWithScheduler[] = [];
  kernel: KernelInterface;
  connections: RedisConnection[] = [];

  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
  }

  getKernel(): KernelInterface {
    return this.kernel;
  }

  getInstance(): WorkerWithScheduler[] {
    return this.queues;
  }

  protected async getRedisConnection(): Promise<RedisInterface> {
    const connection = this.kernel.get(RedisConnection);
    await connection.up();
    this.connections.push(connection);
    return connection.getClient();
  }

  protected getWorker(
    connection: RedisInterface,
    name: string,
    processor: Processor,
  ): Worker {
    const options = { connection } as WorkerOptions;
    return new Worker(name, processor, options);
  }

  protected getScheduler(
    connection: RedisInterface,
    name: string,
  ): QueueScheduler {
    const options = { connection } as QueueSchedulerOptions;
    return new QueueScheduler(name, options);
  }

  protected async getWorkerAndScheduler(
    name: string,
    processor: Processor,
  ): Promise<WorkerWithScheduler> {
    const connection = await this.getRedisConnection();
    return {
      scheduler: this.getScheduler(connection, name),
      worker: this.getWorker(connection, name, processor),
    };
  }

  async up(_opts: string[] = []) {
    const container = this.kernel.getContainer();
    if (!container.isBound(QueueExtension.containerKey)) {
      throw new Error("No queue declared");
    }

    const services = container.getAll<string>(QueueExtension.containerKey);
    for (const service of services) {
      const key = service;
      const { worker, scheduler } = await this.getWorkerAndScheduler(
        key,
        async (job: Job) =>
          this.kernel.call(job.data.method, job.data.params.params, {
            ...job.data.params._context,
            channel: {
              ...(job.data.params._context && job.data.params._context.channel
                ? job.data.params._context.channel
                : {}),
              transport: "queue",
            },
          }),
      );
      this.registerListeners(worker, key);
      this.queues.push({
        worker,
        scheduler,
      });
    }
  }

  async down() {
    for (const { worker, scheduler } of this.queues) {
      try {
        await worker.close();
      } catch (e: any) {
        if (e?.message !== "Connection is closed.") throw e;
      }
      try {
        await scheduler.close();
      } catch (e: any) {
        if (e?.message !== "Connection is closed.") throw e;
      }
    }
    await Promise.all(this.connections.map((c: RedisConnection) => c.down()));
    this.connections = [];
  }

  protected errorHandler(_error: Error, _job?: Job) {
    // Do nothing
  }

  protected registerListeners(queue: Worker, name: string): void {
    queue.on("error", (err: Error) => {
      console.error(`🐮/${name}: error`, err.message);
      this.errorHandler(err);
    });

    queue.on("active", (job: Job) => {
      console.info(`🐮/${name}: active ${job.id} ${job.data.method}`);
    });

    queue.on("progress", (job: Job, progress: number | object) => {
      console.info(
        `🐮/${name}: progress ${job.id} ${job.data.method} : ${progress}`,
      );
    });

    queue.on("completed", (job: Job) => {
      console.info(`🐮/${name}: completed ${job.id} ${job.data.method}`);
    });

    queue.on("failed", (job: Job, err: Error) => {
      console.error(`🐮/${name}: failed ${job.id}`, err.message);
      console.error(err.stack);
      this.errorHandler(err, job);
    });
  }
}
