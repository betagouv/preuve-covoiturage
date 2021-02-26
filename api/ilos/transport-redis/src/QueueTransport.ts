import { Worker, QueueScheduler, Processor, Job, WorkerOptions, QueueSchedulerOptions } from 'bullmq';

import { QueueExtension } from '@ilos/queue';
import { TransportInterface, KernelInterface } from '@ilos/common';
import { RedisConnection, RedisInterface } from '@ilos/connection-redis';

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
export class QueueTransport implements TransportInterface<WorkerWithScheduler[]> {
  queues: WorkerWithScheduler[] = [];
  kernel: KernelInterface;
  connection: RedisConnection;

  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
  }

  getKernel(): KernelInterface {
    return this.kernel;
  }

  getInstance(): WorkerWithScheduler[] {
    return this.queues;
  }

  protected async getRedisConnection(connectionString: string): Promise<RedisInterface> {
    if (!this.connection) {
      this.connection = new RedisConnection({ connectionString });
      await this.connection.up();
    }
    return this.connection.getClient();
  }

  protected getWorker(connection: RedisInterface, name: string, processor: Processor): Worker {
    const options = { connection } as WorkerOptions;
    return new Worker(name, processor, options);
  }

  protected getScheduler(connection: RedisInterface, name: string): QueueScheduler {
    const options = { connection } as QueueSchedulerOptions;
    return new QueueScheduler(name, options);
  }

  protected async getWorkerAndScheduler(
    connectionString: string,
    name: string,
    processor: Processor,
  ): Promise<WorkerWithScheduler> {
    const connection = await this.getRedisConnection(connectionString);
    return {
      scheduler: this.getScheduler(connection, name),
      worker: this.getWorker(connection, name, processor),
    };
  }

  async up(opts: string[] = []) {
    const [redisUrl] = opts;
    if (!redisUrl || !/^redis:\/\//.test(redisUrl)) {
      throw new Error('Redis connection string not configured');
    }

    const container = this.kernel.getContainer();
    if (!container.isBound(QueueExtension.containerKey)) {
      throw new Error('No queue declared');
    }

    const services = container.getAll<string>(QueueExtension.containerKey);
    for (const service of services) {
      const key = service;
      const { worker, scheduler } = await this.getWorkerAndScheduler(redisUrl, key, async (job) =>
        this.kernel.call(job.data.method, job.data.params.params, {
          ...job.data.params._context,
          channel: {
            ...(job.data.params._context && job.data.params._context.channel ? job.data.params._context.channel : {}),
            transport: 'queue',
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
    const promises = [];
    for (const { worker, scheduler } of this.queues) {
      promises.push(worker.close());
      promises.push(scheduler.close());
    }
    await Promise.all(promises);
    await this.connection.down();
  }

  protected errorHandler(_error: Error, _job?: Job) {
    // Do nothing
  }

  protected registerListeners(queue: Worker, name: string): void {
    queue.on('error', (err) => {
      console.error(`🐮/${name}: error`, err.message);
      this.errorHandler(err);
    });

    queue.on('waiting', (jobId) => {
      console.info(`🐮/${name}: waiting ${jobId}`);
    });

    queue.on('active', (job) => {
      console.info(`🐮/${name}: active ${job.id} ${job.data.method}`);
    });

    queue.on('stalled', (job) => {
      console.info(`🐮/${name}: stalled ${job.id} ${job.data.method}`);
    });

    queue.on('progress', (job, progress) => {
      console.info(`🐮/${name}: progress ${job.id} ${job.data.method} : ${progress}`);
    });

    queue.on('completed', (job) => {
      console.info(`🐮/${name}: completed ${job.id} ${job.data.method}`);
    });

    queue.on('failed', (job, err) => {
      console.error(`🐮/${name}: failed ${job.id}`, err.message);
      this.errorHandler(err, job);
    });
  }
}
