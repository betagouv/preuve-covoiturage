import { Bootstrap as BaseBootstrap } from '@ilos/framework';
import { QueueTransport } from '@ilos/transport-redis';
import { TransportInterface } from '@ilos/common';
import { CliTransport } from '@ilos/cli';

import { Kernel } from './Kernel';
import { HttpTransport } from './HttpTransport';

export const bootstrap = BaseBootstrap.create({
  kernel: (): any => Kernel,
  transport: {
    http: (k): TransportInterface => new HttpTransport(k),
    queue: (k): TransportInterface => new QueueTransport(k),
    cli: (k): TransportInterface => new CliTransport(k),
  },
});
