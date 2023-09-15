import { CommandExtension } from '@ilos/cli';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { APDFNameProvider, S3StorageProvider } from '@pdc/provider-storage';
import { CryptoProvider } from '@pdc/provider-crypto';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';

import { binding as listBinding } from './shared/trip/listTrips.schema';
import { binding as searchCountBinding } from './shared/trip/searchcount.schema';
import { binding as statsBinding } from './shared/trip/stats.schema';
import { binding as exportBinding } from './shared/trip/export.schema';
import { binding as buildExportBinding } from './shared/trip/buildExport.schema';
import { binding as sendExportBinding } from './shared/trip/sendExport.schema';
import { binding as publishOpenDataBinding } from './shared/trip/publishOpenData.schema';

import { config } from './config';
import { TripRepositoryProvider } from './providers/TripRepositoryProvider';
import { ListTripsAction } from './actions/ListTripsAction';
import { StatsAction } from './actions/StatsAction';
import { ExportAction } from './actions/ExportAction';
import { SearchCountAction } from './actions/SearchCountAction';
import { BuildExportAction } from './actions/BuildExportAction';
import { FinancialStatsAction } from './actions/FinancialStatsAction';
import { SendExportAction } from './actions/SendExportAction';
import { PublishOpenDataAction } from './actions/PublishOpenDataAction';

import { StatCacheRepositoryProvider } from './providers/StatCacheRepositoryProvider';
import { scopeToGroupBinding } from './middleware/ScopeToGroupMiddleware';

import { TripCacheWarmCron } from './cron/TripCacheWarmCron';
import { DataGouvProvider } from './providers/DataGouvProvider';
import { ReplayOpendataExportCommand } from './commands/ReplayOpendataExportCommand';
import { PublishOpendataCommand } from './commands/PublishOpendataCommand';

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
    TripCacheWarmCron,
    SendExportAction,
    PublishOpenDataAction,
  ],
  queues: ['trip'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [CommandExtension, ValidatorExtension];
}
