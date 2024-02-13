import { Commands } from '@ilos/cli';
import { kernel } from '@ilos/common';
import { Kernel as BaseKernel } from '@ilos/framework';
import { RedisConnection } from '@ilos/connection-redis';
import { SentryProvider } from '@pdc/provider-sentry';
import { TokenProvider } from '@pdc/provider-token';
import { bootstrap as acquisitionBootstrap } from '@pdc/service-acquisition';
import { bootstrap as apdfBootstrap } from '@pdc/service-apdf';
import { bootstrap as applicationBootstrap } from '@pdc/service-application';
import { bootstrap as carpoolBootstrap } from '@pdc/service-carpool';
import { bootstrap as ceeBootstrap } from '@pdc/service-cee';
import { bootstrap as certificateBootstrap } from '@pdc/service-certificate';
import { bootstrap as companyBootstrap } from '@pdc/service-company';
import { bootstrap as exportBootstrap } from '@pdc/service-export';
import { bootstrap as honorBootstrap } from '@pdc/service-honor';
import { bootstrap as monitoringBootstrap } from '@pdc/service-monitoring';
import { bootstrap as operatorBootstrap } from '@pdc/service-operator';
import { bootstrap as policyBootstrap } from '@pdc/service-policy';
import { bootstrap as territoryBootstrap } from '@pdc/service-territory';
import { bootstrap as tripcheckBootstrap } from '@pdc/service-trip';
import { bootstrap as userBootstrap } from '@pdc/service-user';
import { bootstrap as observatoryBootstrap } from '@pdc/service-observatory';
import { bootstrap as geoBootstrap } from '@pdc/service-geo';
import { SeedCommand } from './commands/SeedCommand';
import { config } from './config';

@kernel({
  config,
  children: [
    ...acquisitionBootstrap.serviceProviders,
    ...apdfBootstrap.serviceProviders,
    ...applicationBootstrap.serviceProviders,
    ...carpoolBootstrap.serviceProviders,
    ...ceeBootstrap.serviceProviders,
    ...certificateBootstrap.serviceProviders,
    ...companyBootstrap.serviceProviders,
    ...exportBootstrap.serviceProviders,
    ...honorBootstrap.serviceProviders,
    ...monitoringBootstrap.serviceProviders,
    ...operatorBootstrap.serviceProviders,
    ...policyBootstrap.serviceProviders,
    ...territoryBootstrap.serviceProviders,
    ...tripcheckBootstrap.serviceProviders,
    ...userBootstrap.serviceProviders,
    ...observatoryBootstrap.serviceProviders,
    ...geoBootstrap.serviceProviders,
  ],
  providers: [SentryProvider, TokenProvider],
  commands: [SeedCommand, Commands.CallCommand],
  connections: [[RedisConnection, 'connections.redis']],
})
export class Kernel extends BaseKernel {}
