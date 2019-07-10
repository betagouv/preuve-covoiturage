import { bootstrap as baseBootstrap } from '@ilos/framework';

import { ServiceProvider } from './ServiceProvider';

export const bootstrap = baseBootstrap.create({
  serviceProviders: [ServiceProvider],
});
