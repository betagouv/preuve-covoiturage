import { Bootstrap as BaseBootstrap } from '@ilos/framework';

import { ServiceProvider } from './ServiceProvider';

export const bootstrap = BaseBootstrap.create({
  serviceProviders: [ServiceProvider],
});
