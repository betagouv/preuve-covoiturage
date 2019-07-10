import { bootstrap as baseBootstrap } from '@ilos/framework';

import { HttpTransport } from './HttpTransport';
import { Kernel } from './Kernel';

export const bootstrap = baseBootstrap.create({
  kernel: () => Kernel,
  transport: {
    http: (k) => new HttpTransport(k),
  },
});
