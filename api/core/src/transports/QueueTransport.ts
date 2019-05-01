import { Queue } from 'bull';

import { TransportInterface } from '../interfaces/TransportInterface';
import { KernelInterface } from '../interfaces/KernelInterface';
import { bullFactory } from '../helpers/bullFactory';
import { ContainerInterface } from '../Container';

export class QueueTransport implements TransportInterface {
  queues: Queue[] = [];
  kernel: KernelInterface;

  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
  }

  async up(opts: string[] = []) {
    const [redisUrl, env] = opts;
    // throw error

    const container = <ContainerInterface>this.kernel.getContainer();
    (new Set(container
      .getHandlers()
      .filter(cfg => 'transport' in cfg && cfg.transport === 'local')
      .map(cfg => cfg.service),
    ))
      .forEach((service) => {
        const queue = bullFactory(`${env}-${service}`, redisUrl);
        this.queues.push(queue);
        queue.process(job => this.kernel.handle({
          jsonrpc: '2.0',
          id: 1,
          method: job.data.method,
          params: {
            params: job.data.params.params,
            _context: {
              ...job.data.params._context,
              transport: 'queue',
            },
          },
        }));
      });
  }

  async down() {
    const promises = [];
    for (const queue of this.queues) {
      promises.push(queue.close());
    }
    await Promise.all(promises);
  }
}
