import { CommandExtension } from '@ilos/cli';
import { serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorMiddleware } from '@pdc/provider-validator';
import { ChannelTransportMiddleware, ScopeToSelfMiddleware } from '@pdc/provider-middleware';

import { binding as listBinding } from './shared/trip/list.schema';
import { binding as statsBinding } from './shared/trip/stats.schema';
import { TripPgRepositoryProvider } from './providers/TripPgRepositoryProvider';
import { CrosscheckAction } from './actions/CrosscheckAction';
import { DispatchAction } from './actions/DispatchAction';
import { ListAction } from './actions/ListAction';
import { StatsAction } from './actions/StatsAction';
import { MigrateDataCommand } from './commands/MigrateDataCommand';
import { PublicStatsAction } from './actions/PublicStatsAction';

@serviceProvider({
  config: __dirname,
  commands: [MigrateDataCommand],
  providers: [TripPgRepositoryProvider],
  validator: [listBinding, statsBinding],
  middlewares: [
    ['validate', ValidatorMiddleware],
    ['channel.transport', ChannelTransportMiddleware],
    ['scopeIt', ScopeToSelfMiddleware],
  ],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  handlers: [CrosscheckAction, DispatchAction, ListAction, PublicStatsAction, StatsAction],
  queues: ['trip'],
})
export class ServiceProvider extends AbstractServiceProvider {
  extensions = [CommandExtension];
}
