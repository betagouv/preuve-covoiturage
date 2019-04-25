import { Queue } from 'bull';

import { TransportInterface } from '../interfaces/TransportInterface';
import { KernelInterface } from '../interfaces/KernelInterface';
import { bullFactory } from '../helpers/bullFactory';
import { ConfigProvider } from '../providers/ConfigProvider';
import { EnvProvider } from '../providers/EnvProvider';

export class QueueTransport implements TransportInterface {
  queues: Queue[] = [];
  kernel: KernelInterface;
  opts: string[];

  constructor(kernel: KernelInterface, opts: string[] = []) {
    this.kernel = kernel;
    this.opts = opts;
  }

  async up() {
    const redisUrl = (<ConfigProvider>this.kernel.get('config')).get('redisUrl');
    const env = (<EnvProvider>this.kernel.get('env')).get('NODE_ENV');

    this.opts.forEach((signature) => {
      const queue = bullFactory(`${env}-${signature}`, redisUrl);
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
