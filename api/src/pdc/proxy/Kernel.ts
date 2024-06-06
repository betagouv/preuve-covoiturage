import { Commands } from '/ilos/cli/index.ts';
import { kernel } from '/ilos/common/index.ts';
import { Kernel as BaseKernel } from '/ilos/framework/index.ts';
import { RedisConnection } from '/ilos/connection-redis/index.ts';
import { SentryProvider } from '/pdc/providers/sentry/index.ts';
import { TokenProvider } from '/pdc/providers/token/index.ts';
import { ServiceProvider as AcquisitionServiceProvider } from '/pdc/services/acquisition/ServiceProvider.ts';
import { ServiceProvider as ApdfServiceProvider } from '/pdc/services/apdf/ServiceProvider.ts';
import { ServiceProvider as ApplicationServiceProvider } from '/pdc/services/application/ServiceProvider.ts';
import { ServiceProvider as CarpoolServiceProvider } from '/pdc/services/carpool/ServiceProvider.ts';
import { ServiceProvider as CeeServiceProvider } from '/pdc/services/cee/ServiceProvider.ts';
import { ServiceProvider as CertificateServiceProvider } from '/pdc/services/certificate/ServiceProvider.ts';
import { ServiceProvider as CompanyServiceProvider } from '/pdc/services/company/ServiceProvider.ts';
import { ServiceProvider as ExportServiceProvider } from '/pdc/services/export/ServiceProvider.ts';
import { ServiceProvider as HonorServiceProvider } from '/pdc/services/honor/ServiceProvider.ts';
import { ServiceProvider as MonitoringServiceProvider } from '/pdc/services/monitoring/ServiceProvider.ts';
import { ServiceProvider as OperatorServiceProvider } from '/pdc/services/operator/ServiceProvider.ts';
import { ServiceProvider as PolicyServiceProvider } from '/pdc/services/policy/ServiceProvider.ts';
import { ServiceProvider as TerritoryServiceProvider } from '/pdc/services/territory/ServiceProvider.ts';
import { ServiceProvider as TripcheckServiceProvider } from '/pdc/services/trip/ServiceProvider.ts';
import { ServiceProvider as UserServiceProvider } from '/pdc/services/user/ServiceProvider.ts';
import { ServiceProvider as ObservatoryServiceProvider } from '/pdc/services/observatory/ServiceProvider.ts';
import { ServiceProvider as GeoServiceProvider } from '/pdc/services/geo/ServiceProvider.ts';
import { SeedCommand } from './commands/SeedCommand.ts';
import { config } from './config/index.ts';
import { PostgresConnection } from '../../ilos/connection-postgres/index.ts';

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
    [PostgresConnection, new PostgresConnection(config.connections.postgres)],
  ],
})
export class Kernel extends BaseKernel {}
