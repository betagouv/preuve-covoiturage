import { Commands } from '@ilos/cli';
import { kernel } from '@ilos/common';
import { Kernel as BaseKernel } from '@ilos/framework';
import { RedisConnection } from '@ilos/connection-redis';
import { SentryProvider } from '@pdc/providers/sentry';
import { TokenProvider } from '@pdc/providers/token';
import { ServiceProvider as AcquisitionServiceProvider } from '@pdc/services/acquisition/ServiceProvider';
import { ServiceProvider as ApdfServiceProvider } from '@pdc/services/apdf/ServiceProvider';
import { ServiceProvider as ApplicationServiceProvider } from '@pdc/services/application/ServiceProvider';
import { ServiceProvider as CarpoolServiceProvider } from '@pdc/services/carpool/ServiceProvider';
import { ServiceProvider as CeeServiceProvider } from '@pdc/services/cee/ServiceProvider';
import { ServiceProvider as CertificateServiceProvider } from '@pdc/services/certificate/ServiceProvider';
import { ServiceProvider as CompanyServiceProvider } from '@pdc/services/company/ServiceProvider';
import { ServiceProvider as ExportServiceProvider } from '@pdc/services/export/ServiceProvider';
import { ServiceProvider as HonorServiceProvider } from '@pdc/services/honor/ServiceProvider';
import { ServiceProvider as MonitoringServiceProvider } from '@pdc/services/monitoring/ServiceProvider';
import { ServiceProvider as OperatorServiceProvider } from '@pdc/services/operator/ServiceProvider';
import { ServiceProvider as PolicyServiceProvider } from '@pdc/services/policy/ServiceProvider';
import { ServiceProvider as TerritoryServiceProvider } from '@pdc/services/territory/ServiceProvider';
import { ServiceProvider as TripcheckServiceProvider } from '@pdc/services/trip/ServiceProvider';
import { ServiceProvider as UserServiceProvider } from '@pdc/services/user/ServiceProvider';
import { ServiceProvider as ObservatoryServiceProvider } from '@pdc/services/observatory/ServiceProvider';
import { ServiceProvider as GeoServiceProvider } from '@pdc/services/geo/ServiceProvider';
import { SeedCommand } from './commands/SeedCommand';
import { config } from './config';
import { PostgresConnection } from '../../ilos/connection-postgres';

@kernel({
  config,
  children: [
    AcquisitionServiceProvider,
    ApdfServiceProvider,
    ApplicationServiceProvider,
    CarpoolServiceProvider,
    CeeServiceProvider,
    CertificateServiceProvider,
    CompanyServiceProvider,
    ExportServiceProvider,
    HonorServiceProvider,
    MonitoringServiceProvider,
    OperatorServiceProvider,
    PolicyServiceProvider,
    TerritoryServiceProvider,
    TripcheckServiceProvider,
    UserServiceProvider,
    ObservatoryServiceProvider,
    GeoServiceProvider,
  ],
  providers: [SentryProvider, TokenProvider],
  commands: [SeedCommand, Commands.CallCommand],
  connections: [
    [RedisConnection, new RedisConnection(config.connections.redis)],
    [PostgresConnection, new PostgresConnection(config.connections.postgres)]
  ],
})
export class Kernel extends BaseKernel {}
