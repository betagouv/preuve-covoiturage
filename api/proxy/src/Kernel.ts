import { Commands } from '@ilos/cli';
import { kernel } from '@ilos/common';
import { Kernel as BaseKernel } from '@ilos/framework';
import { SentryProvider } from '@pdc/provider-sentry';
import { TokenProvider } from '@pdc/provider-token';
import { bootstrap as acquisitionBootstrap } from '@pdc/service-acquisition';
import { bootstrap as applicationBootstrap } from '@pdc/service-application';
import { bootstrap as carpoolBootstrap } from '@pdc/service-carpool';
import { bootstrap as certificateBootstrap } from '@pdc/service-certificate';
import { bootstrap as companyBootstrap } from '@pdc/service-company';
import { bootstrap as fraudBootstrap } from '@pdc/service-fraud';
import { bootstrap as normalizationBootstrap } from '@pdc/service-normalization';
import { bootstrap as operatorBootstrap } from '@pdc/service-operator';
import { bootstrap as policyBootstrap } from '@pdc/service-policy';
import { bootstrap as territoryBootstrap } from '@pdc/service-territory';
import { bootstrap as tripcheckBootstrap } from '@pdc/service-trip';
import { bootstrap as userBootstrap } from '@pdc/service-user';
import { bootstrap as monitoringBootstrap } from '@pdc/service-monitoring';
import { bootstrap as honorBootstrap } from '@pdc/service-honor';

import { config } from './config';
import { ProcessJourneyCommand } from './commands/ProcessJourneyCommand';
import { SyncGeoShapeCommand } from './commands/SyncGeoShapeCommand';
// import { SyncTerritoryInseeCommand } from './commands/SyncTerritoryInseeCommand';
// import { SyncRegionDepCommand } from './commands/SyncRegionDepCommand';
import { SyncGeoSurfacePopulationCommand } from './commands/SyncSurfacePopulationCommand';
import { SeedCommand } from './commands/SeedCommand';

@kernel({
  config,
  children: [
    ...applicationBootstrap.serviceProviders,
    ...acquisitionBootstrap.serviceProviders,
    ...carpoolBootstrap.serviceProviders,
    ...companyBootstrap.serviceProviders,
    ...fraudBootstrap.serviceProviders,
    ...normalizationBootstrap.serviceProviders,
    ...operatorBootstrap.serviceProviders,
    ...policyBootstrap.serviceProviders,
    ...territoryBootstrap.serviceProviders,
    ...tripcheckBootstrap.serviceProviders,
    ...userBootstrap.serviceProviders,
    ...certificateBootstrap.serviceProviders,
    ...monitoringBootstrap.serviceProviders,
    ...honorBootstrap.serviceProviders,
  ],
  providers: [SentryProvider, TokenProvider],
  commands: [
    ProcessJourneyCommand,
    // SyncTerritoryInseeCommand,
    // SyncRegionDepCommand,
    SyncGeoShapeCommand,
    SeedCommand,
    SyncGeoSurfacePopulationCommand,
    Commands.CallCommand,
  ],
})
export class Kernel extends BaseKernel {}
