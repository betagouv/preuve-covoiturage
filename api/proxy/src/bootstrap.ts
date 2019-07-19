import { Bootstrap as BaseBootstrap } from '@ilos/framework';
import { QueueTransport } from '@ilos/transport-redis';

import { Kernel } from './Kernel';
import { HttpTransport } from './HttpTransport';

export const bootstrap = BaseBootstrap.create({
  kernel: () => Kernel,
  transport: {
    http: (k) => new HttpTransport(k),
    queue: (k) => new QueueTransport(k),
  },
});
