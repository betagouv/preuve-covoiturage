import { serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { MongoConnection } from '@ilos/connection-mongo';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorMiddleware } from '@pdc/provider-validator';
// import { journeyCreateSchema } from '@pdc/provider-schema';
import { ChannelTransportMiddleware } from '@pdc/provider-middleware';

import { CrosscheckAction } from './actions/CrosscheckAction';
import { DispatchAction } from './actions/DispatchAction';
import { TripRepositoryProvider } from './providers/TripRepositoryProvider';

@serviceProvider({
  config: __dirname,
  providers: [TripRepositoryProvider],
  // validator: [['trip.crosscheck', journeyCreateSchema]],
  middlewares: [['validate', ValidatorMiddleware], ['channel.transport', ChannelTransportMiddleware]],
  connections: [
    [MongoConnection, 'connections.mongo'],
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  handlers: [CrosscheckAction, DispatchAction],
  queues: ['trip'],
})
export class ServiceProvider extends AbstractServiceProvider {}
