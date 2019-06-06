import { Queue } from 'bull';

import { TransportInterface } from '../interfaces/TransportInterface';
import { KernelInterface } from '../interfaces/KernelInterface';
import { bullFactory } from '../helpers/bullFactory';
import { ContainerInterface } from '../container';

export class QueueTransport implements TransportInterface {
  queues: Queue[] = [];
  kernel: KernelInterface;

  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
  }

  getKernel(): KernelInterface {
    return this.kernel;
  }

  async up(opts: string[] = []) {
    const [redisUrl, env] = opts;
    // throw error

    const container = <ContainerInterface>this.kernel.getContainer();
    const services = Array.from(
      new Set(
        container
          .getHandlers()
          .filter((cfg) => 'local' in cfg && cfg.local && ('queue' in cfg && !cfg.queue))
          .map((cfg) => cfg.service),
      ),
    );

    for (const service of services) {
      const key = `${env}-${service}`;
      // TODO : add Sentry error handler
      const queue = bullFactory(key, redisUrl);
      await queue.isReady();

      this.registerListeners(queue, key);
      this.queues.push(queue);

      queue.process((job) =>
        this.kernel.handle({
          jsonrpc: '2.0',
          id: 1,
          method: job.data.method,
          params: {
            params: job.data.params.params,
            _context: {
              ...job.data.params._context,
            },
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
      console.log(`🐮/${name}: active ${job.id} ${job.data.type}`);
    });

    queue.on('stalled', (job) => {
      console.log(`🐮/${name}: stalled ${job.id} ${job.data.type}`);
    });

    queue.on('progress', (job, progress) => {
      console.log(`🐮/${name}: progress ${job.id} ${job.data.type} : ${progress}`);
    });

    queue.on('completed', (job) => {
      console.log(`🐮/${name}: completed ${job.id} ${job.data.type}`);
      job.remove();
    });

    queue.on('failed', (job, err) => {
      console.log(`🐮/${name}: failed ${job.id} ${job.data.type}`, err.message);
      if (errorHandler && typeof errorHandler === 'function') {
        errorHandler(err);
      }
    });
  }
}
