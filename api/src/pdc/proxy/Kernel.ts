import { kernel } from "@/ilos/common/index.ts";
import { RedisConnection } from "@/ilos/connection-redis/index.ts";
import { Kernel as BaseKernel } from "@/ilos/framework/index.ts";
import { SentryProvider } from "@/pdc/providers/sentry/index.ts";
import { TokenProvider } from "@/pdc/providers/token/index.ts";
import { ListCommand } from "@/pdc/proxy/commands/ListCommand.ts";
import { MonitoringServiceProvider } from "@/pdc/services/monitoring/MonitoringServiceProvider.ts";
import { PostgresConnection } from "../../ilos/connection-postgres/index.ts";
import { AcquisitionServiceProvider } from "../services/acquisition/AcquisitionServiceProvider.ts";
import { APDFServiceProvider } from "../services/apdf/APDFServiceProvider.ts";
import { ApplicationServiceProvider } from "../services/application/ApplicationServiceProvider.ts";
import { CarpoolServiceProvider } from "../services/carpool/CarpoolServiceProvider.ts";
import { CeeServiceProvider } from "../services/cee/CeeServiceProvider.ts";
import { CertificateServiceProvider } from "../services/certificate/CertificateServiceProvider.ts";
import { CompanyServiceProvider } from "../services/company/CompanyServiceProvider.ts";
import { ExportServiceProvider } from "../services/export/ExportServiceProvider.ts";
import { GeoServiceProvider } from "../services/geo/GeoServiceProvider.ts";
import { HonorServiceProvider } from "../services/honor/HonorServiceProvider.ts";
import { ObservatoryServiceProvider } from "../services/observatory/ObservatoryServiceProvider.ts";
import { OperatorServiceProvider } from "../services/operator/OperatorServiceProvider.ts";
import { PolicyServiceProvider } from "../services/policy/PolicyServiceProvider.ts";
import { TerritoryServiceProvider } from "../services/territory/TerritoryServiceProvider.ts";
import { UserServiceProvider } from "../services/user/UserServiceProvider.ts";
import { SeedCommand } from "./commands/SeedCommand.ts";
import { config } from "./config/index.ts";

@kernel({
  config,
  children: [
    AcquisitionServiceProvider,
    APDFServiceProvider,
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
    UserServiceProvider,
    ObservatoryServiceProvider,
    GeoServiceProvider,
  ],
  commands: [SeedCommand, ListCommand],
  providers: [
    SentryProvider,
    TokenProvider,
    [RedisConnection, new RedisConnection(config.connections.redis)],
    [PostgresConnection, new PostgresConnection(config.connections.postgres)],
  ],
})
export class Kernel extends BaseKernel {}
