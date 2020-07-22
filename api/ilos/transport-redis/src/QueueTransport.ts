import { Queue } from 'bull';

import { QueueExtension } from '@ilos/queue';
import { TransportInterface, KernelInterface } from '@ilos/common';

import { bullFactory } from './helpers/bullFactory';

/**
 * Queue Transport
 * @export
 * @class QueueTransport
 * @implements {TransportInterface}
 */
export class QueueTransport implements TransportInterface<Queue[]> {
  queues: Queue[] = [];
  kernel: KernelInterface;

  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
  }

  getKernel(): KernelInterface {
    return this.kernel;
  }

  getInstance(): Queue[] {
    return this.queues;
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
      // TODO : add Sentry error handler
      // TODO : add named job
      const queue = bullFactory(key, redisUrl);
      await queue.isReady();

      this.registerListeners(queue, key);
      this.queues.push(queue);
      queue.process(async (job) =>
        this.kernel.call(job.data.method, job.data.params.params, {
          ...job.data.params._context,
          channel: {
            ...(job.data.params._context && job.data.params._context.channel ? job.data.params._context.channel : {}),
            transport: 'queue',
          },
        }),
      );
    }
  }

  async down() {
    const promises = [];
    for (const queue of this.queues) {
      promises.push(queue.close());
    }
    await Promise.all(promises);
  }

  protected registerListeners(queue: Queue, name: string, errorHandler?: Function): void {
    queue.on('error', (err) => {
      console.log(`🐮/${name}: error`, err.message);
      if (errorHandler && typeof errorHandler === 'function') {
        errorHandler(err);
      }
    });

    queue.on('waiting', (jobId) => {
      console.log(`🐮/${name}: waiting ${jobId}`);
    });

    queue.on('active', (job) => {
      console.log(`🐮/${name}: active ${job.id} ${job.data.method}`);
    });

    queue.on('stalled', (job) => {
      console.log(`🐮/${name}: stalled ${job.id} ${job.data.method}`);
    });

    queue.on('progress', (job, progress) => {
      console.log(`🐮/${name}: progress ${job.id} ${job.data.method} : ${progress}`);
    });

    queue.on('completed', (job) => {
      console.log(`🐮/${name}: completed ${job.id} ${job.data.method}`);
      // job.remove();
    });

    queue.on('failed', (job, err) => {
      console.log(`🐮/${name}: failed ${job.id}`, err.message);
      console.log(JSON.stringify(job.data));
      if (errorHandler && typeof errorHandler === 'function') {
        errorHandler(err);
      }
    });
  }
}
