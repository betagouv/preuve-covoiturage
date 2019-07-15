import { Bootstrap as BaseBootstrap } from '@ilos/framework';

import { HttpTransport } from './HttpTransport';
import { Kernel } from './Kernel';

export const bootstrap = BaseBootstrap.create({
  kernel: () => Kernel,
  transport: {
    http: (k) => new HttpTransport(k),
  },
});
