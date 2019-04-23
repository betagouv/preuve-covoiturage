import { Queue } from 'bull';

import { TransportInterface } from '../interfaces/TransportInterface';
import { KernelInterface } from '../interfaces/KernelInterface';
import { bullFactory } from '../helpers/bullFactory';
import { ConfigProvider } from '../providers/ConfigProvider';
import { EnvProvider } from '../providers/EnvProvider';

export class QueueTransport implements TransportInterface {
  queues: Queue[] = [];
  kernel: KernelInterface;
  services: string[];

  constructor(kernel: KernelInterface, options: { services: string[] }) {
    this.kernel = kernel;
    this.services = options.services;
  }

  async up() {
    const redisUrl = (<ConfigProvider>this.kernel.get('config')).get('redisUrl');
    const env = (<EnvProvider>this.kernel.get('env')).get('NODE_ENV');

    this.services.forEach((signature) => {
      const queue = bullFactory(`${env}-${signature}`, redisUrl);
      this.queues.push(queue);
      queue.process(job => this.kernel.handle(job.data));
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
