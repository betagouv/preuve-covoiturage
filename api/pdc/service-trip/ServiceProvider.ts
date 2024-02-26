import { CommandExtension } from '@ilos/cli';
import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { CryptoProvider } from '@pdc/provider-crypto';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { APDFNameProvider, S3StorageProvider } from '@pdc/provider-storage';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { BuildExportAction } from './actions/BuildExportAction';
import { ExportAction } from './actions/ExportAction';
import { FinancialStatsAction } from './actions/FinancialStatsAction';
import { ListTripsAction } from './actions/ListTripsAction';
import { PublishOpenDataAction } from './actions/PublishOpenDataAction';
import { SearchCountAction } from './actions/SearchCountAction';
import { SendExportAction } from './actions/SendExportAction';
import { StatsAction } from './actions/StatsAction';
import { PublishOpendataCommand } from './commands/PublishOpendataCommand';
import { ReplayOpendataExportCommand } from './commands/ReplayOpendataExportCommand';
import { config } from './config';
import { scopeToGroupBinding } from './middleware/ScopeToGroupMiddleware';
import { DataGouvProvider } from './providers/DataGouvProvider';
import { StatCacheRepositoryProvider } from './providers/StatCacheRepositoryProvider';
import { TripRepositoryProvider } from './providers/TripRepositoryProvider';
import { binding as buildExportBinding } from '@shared/trip/buildExport.schema';
import { binding as exportBinding } from '@shared/trip/export.schema';
import { binding as listBinding } from '@shared/trip/listTrips.schema';
import { binding as publishOpenDataBinding } from '@shared/trip/publishOpenData.schema';
import { binding as searchCountBinding } from '@shared/trip/searchcount.schema';
import { binding as sendExportBinding } from '@shared/trip/sendExport.schema';
import { binding as statsBinding } from '@shared/trip/stats.schema';

@serviceProvider({
  config,
  providers: [
    APDFNameProvider,
    CryptoProvider,
    DataGouvProvider,
    S3StorageProvider,
    StatCacheRepositoryProvider,
    TripRepositoryProvider,
  ],
  validator: [
    listBinding,
    searchCountBinding,
    statsBinding,
    exportBinding,
    buildExportBinding,
    sendExportBinding,
    publishOpenDataBinding,
  ],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware], scopeToGroupBinding],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  commands: [ReplayOpendataExportCommand, PublishOpendataCommand],
  handlers: [
    ListTripsAction,
    SearchCountAction,
    StatsAction,
    FinancialStatsAction,
    ExportAction,
    BuildExportAction,
    SendExportAction,
    PublishOpenDataAction,
  ],
  queues: ['trip'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [CommandExtension, ValidatorExtension];
}
