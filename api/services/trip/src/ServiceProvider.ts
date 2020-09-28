import { CommandExtension } from '@ilos/cli';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { S3StorageProvider } from '@pdc/provider-file';
import { CryptoProvider } from '@pdc/provider-crypto';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import {
  ChannelTransportMiddleware,
  ChannelServiceWhitelistMiddleware,
} from '@pdc/provider-middleware';

import { binding as listBinding } from './shared/trip/list.schema';
import { binding as searchCountBinding } from './shared/trip/searchcount.schema';
import { binding as statsBinding } from './shared/trip/stats.schema';
import { binding as exportBinding } from './shared/trip/export.schema';
import { binding as buildExportBinding } from './shared/trip/buildExport.schema';

import { config } from './config';
import { TripRepositoryProvider } from './providers/TripRepositoryProvider';
import { ListAction } from './actions/ListAction';
import { StatsAction } from './actions/StatsAction';
import { ExportAction } from './actions/ExportAction';
import { SearchCountAction } from './actions/SearchCountAction';
import { BuildExportAction } from './actions/BuildExportAction';
import { StatCacheRepositoryProvider } from './providers/StatCacheRepositoryProvider';
import { ScopeToGroupMiddleware } from './middleware/ScopeToGroupMiddleware';
import { TripCacheWarmCron } from './cron/TripCacheWarmCron';

@serviceProvider({
  config,
  providers: [TripRepositoryProvider, StatCacheRepositoryProvider, S3StorageProvider, CryptoProvider],
  validator: [listBinding, searchCountBinding, statsBinding, exportBinding, buildExportBinding],
  middlewares: [
    ['validate', ValidatorMiddleware],
    ['channel.service.only', ChannelServiceWhitelistMiddleware],
    ['channel.transport', ChannelTransportMiddleware],
    ['scopeToGroup', ScopeToGroupMiddleware],
  ],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  handlers: [ListAction, SearchCountAction, StatsAction, ExportAction, BuildExportAction, TripCacheWarmCron],
  queues: ['trip'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [CommandExtension, ValidatorExtension];
}
