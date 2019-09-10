import { serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { MongoConnection } from '@ilos/connection-mongo';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorMiddleware } from '@pdc/provider-validator';
import { journeyCreateSchema } from '@pdc/provider-schema';

import { CrosscheckProcessAction } from './actions/CrosscheckProcessAction';
import { TripRepositoryProvider } from './providers/TripRepositoryProvider';

@serviceProvider({
  config: __dirname,
  providers: [TripRepositoryProvider],
  // validator: [['crosscheck.process', journeyCreateSchema]],
  middlewares: [['validate', ValidatorMiddleware], ['channel.transport', ChannelTransportMiddleware]],
  connections: [[MongoConnection, 'connections.mongo'], [RedisConnection, 'connections.redis']],
  handlers: [CrosscheckProcessAction],
  queues: ['crosscheck'],
})
export class ServiceProvider extends AbstractServiceProvider {}
