import { Commands } from '@ilos/cli';
import { kernel } from '@ilos/common';
import { Kernel as BaseKernel } from '@ilos/framework';
import { RedisConnection } from '@ilos/connection-redis';
import { SentryProvider } from '@pdc/providers/sentry';
import { TokenProvider } from '@pdc/providers/token';
import { bootstrap as acquisitionBootstrap } from '@pdc/services/acquisition/bootstrap';
import { bootstrap as apdfBootstrap } from '@pdc/services/apdf/bootstrap';
import { bootstrap as applicationBootstrap } from '@pdc/services/application/bootstrap';
import { bootstrap as carpoolBootstrap } from '@pdc/services/carpool/bootstrap';
import { bootstrap as ceeBootstrap } from '@pdc/services/cee/bootstrap';
import { bootstrap as certificateBootstrap } from '@pdc/services/certificate/bootstrap';
import { bootstrap as companyBootstrap } from '@pdc/services/company/bootstrap';
import { bootstrap as exportBootstrap } from '@pdc/services/export/bootstrap';
import { bootstrap as honorBootstrap } from '@pdc/services/honor/bootstrap';
import { bootstrap as monitoringBootstrap } from '@pdc/services/monitoring/bootstrap';
import { bootstrap as operatorBootstrap } from '@pdc/services/operator/bootstrap';
import { bootstrap as policyBootstrap } from '@pdc/services/policy/bootstrap';
import { bootstrap as territoryBootstrap } from '@pdc/services/territory/bootstrap';
import { bootstrap as tripcheckBootstrap } from '@pdc/services/trip/bootstrap';
import { bootstrap as userBootstrap } from '@pdc/services/user/bootstrap';
import { bootstrap as observatoryBootstrap } from '@pdc/services/observatory/bootstrap';
import { bootstrap as geoBootstrap } from '@pdc/services/geo/bootstrap';
import { SeedCommand } from './commands/SeedCommand';
import { config } from './config';
import { PostgresConnection } from '../../ilos/connection-postgres';

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
  connections: [
    [RedisConnection, new RedisConnection(config.connections.redis)],
    [PostgresConnection, new PostgresConnection(config.connections.postgres)]
  ],
})
export class Kernel extends BaseKernel {}
