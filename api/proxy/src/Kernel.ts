import { kernel } from '@ilos/common';
import { Kernel as BaseKernel } from '@ilos/framework';
import { SentryProvider } from '@pdc/provider-sentry';
import { TokenProvider } from '@pdc/provider-token';
import { bootstrap as userBootstrap } from '@pdc/service-user';
import { bootstrap as operatorBootstrap } from '@pdc/service-operator';
import { bootstrap as territoryBootstrap } from '@pdc/service-territory';
import { bootstrap as applicationBootstrap } from '@pdc/service-application';
import { bootstrap as acquisitionBootstrap } from '@pdc/service-acquisition';
import { bootstrap as normalizationBootstrap } from '@pdc/service-normalization';
import { bootstrap as tripcheckBootstrap } from '@pdc/service-trip';
import { bootstrap as policyBootstrap } from '@pdc/service-policy';

import { UpgradeJourneyCommand } from './commands/UpgradeJourneyCommand';
import { MapIdCommand } from './commands/MapIdCommand';
import { MigrateInseeCommand } from './commands/InseeSeedCommand';

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
    ...policyBootstrap.serviceProviders,
  ],
  providers: [SentryProvider, TokenProvider],
  commands: [UpgradeJourneyCommand, MapIdCommand, MigrateInseeCommand],
})
export class Kernel extends BaseKernel {}
