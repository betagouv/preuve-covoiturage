import { kernel } from '@ilos/common';
import { Kernel as BaseKernel } from '@ilos/framework';
import { SentryProvider } from '@pdc/provider-sentry';
import { bootstrap as userBootstrap } from '@pdc/service-user';
import { bootstrap as operatorBootstrap } from '@pdc/service-operator';
import { bootstrap as territoryBootstrap } from '@pdc/service-territory';
import { bootstrap as applicationBootstrap } from '@pdc/service-application';
import { bootstrap as acquisitionBootstrap } from '@pdc/service-acquisition';
import { bootstrap as normalizationBootstrap } from '@pdc/service-normalization';
import { bootstrap as tripcheckBootstrap } from '@pdc/service-trip';

import { UpgradeJourneyCommand } from './commands/UpgradeJourneyCommand';

@kernel({
  env: null,
  config: __dirname,
  children: [
    ...applicationBootstrap.serviceProviders,
    ...acquisitionBootstrap.serviceProviders,
    ...userBootstrap.serviceProviders,
    ...territoryBootstrap.serviceProviders,
    ...operatorBootstrap.serviceProviders,
    ...normalizationBootstrap.serviceProviders,
    ...tripcheckBootstrap.serviceProviders,
  ],
  providers: [SentryProvider],
  commands: [UpgradeJourneyCommand],
})
export class Kernel extends BaseKernel {}
