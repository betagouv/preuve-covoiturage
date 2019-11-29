import { CommandExtension } from '@ilos/cli';
import { serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorMiddleware } from '@pdc/provider-validator';
import {
  ChannelTransportMiddleware,
  ScopeToSelfMiddleware,
  ChannelServiceWhitelistMiddleware,
} from '@pdc/provider-middleware';

import { binding as listBinding } from './shared/trip/list.schema';
import { binding as statsBinding } from './shared/trip/stats.schema';
import { binding as exportBinding } from './shared/trip/export.schema';

import { TripRepositoryProvider } from './providers/TripRepositoryProvider';
import { ListAction } from './actions/ListAction';
import { StatsAction } from './actions/StatsAction';
import { PublicStatsAction } from './actions/PublicStatsAction';
import { RefreshAction } from './actions/RefreshAction';
import { ExportAction } from './actions/ExportAction';
import { BuildExportAction } from './actions/BuildExportAction';

@serviceProvider({
  config: __dirname,
  providers: [TripRepositoryProvider],
  validator: [listBinding, statsBinding, exportBinding],
  middlewares: [
    ['validate', ValidatorMiddleware],
    ['channel.service.only', ChannelServiceWhitelistMiddleware],
    ['channel.transport', ChannelTransportMiddleware],
    ['scopeIt', ScopeToSelfMiddleware],
  ],
  connections: [[RedisConnection, 'connections.redis'], [PostgresConnection, 'connections.postgres']],
  handlers: [ListAction, PublicStatsAction, StatsAction, RefreshAction, ExportAction, BuildExportAction],
  queues: ['trip'],
})
export class ServiceProvider extends AbstractServiceProvider {
  extensions = [CommandExtension];
}
