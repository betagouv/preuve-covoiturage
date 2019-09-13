import { serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { MongoConnection } from '@ilos/connection-mongo';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorMiddleware } from '@pdc/provider-validator';
import { tripCrosscheckSchema, tripSearchSchema } from '@pdc/provider-schema';
import { ChannelTransportMiddleware, ScopeToSelfMiddleware } from '@pdc/provider-middleware';

import { CrosscheckAction } from './actions/CrosscheckAction';
import { DispatchAction } from './actions/DispatchAction';
import { TripRepositoryProvider } from './providers/TripRepositoryProvider';
import { ListAction } from './actions/ListAction';
import { StatsAction } from './actions/StatsAction';

@serviceProvider({
  config: __dirname,
  providers: [TripRepositoryProvider],
  validator: [['trip.crosscheck', tripCrosscheckSchema], ['trip.search', tripSearchSchema]],
  middlewares: [
    ['validate', ValidatorMiddleware],
    ['channel.transport', ChannelTransportMiddleware],
    ['scopeIt', ScopeToSelfMiddleware],
  ],
  connections: [
    [MongoConnection, 'connections.mongo'],
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  handlers: [CrosscheckAction, DispatchAction, ListAction, StatsAction],
  queues: ['trip'],
})
export class ServiceProvider extends AbstractServiceProvider {}
