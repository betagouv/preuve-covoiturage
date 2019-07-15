import { kernel } from '@ilos/common';
import { Kernel as BaseKernel } from '@ilos/framework';
import { SentryProvider } from '@pdc/provider-sentry';

import { bootstrap as acquisitionBootstrap } from '@pdc/service-acquisition';
import { bootstrap as userBootstrap } from '@pdc/service-user';
import { bootstrap as territoryBootstrap } from '@pdc/service-territory';
import { bootstrap as operatorBootstrap } from '@pdc/service-operator';

@kernel({
  env: null,
  config: __dirname,
  children: [
    ...acquisitionBootstrap.serviceProviders,
    ...userBootstrap.serviceProviders,
    ...territoryBootstrap.serviceProviders,
    ...operatorBootstrap.serviceProviders,
  ],
  providers: [SentryProvider],
})
export class Kernel extends BaseKernel {}
