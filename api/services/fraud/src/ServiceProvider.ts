import { serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorMiddleware } from '@pdc/provider-validator';
import { ChannelTransportMiddleware } from '@pdc/provider-middleware';

import { FraudCheckRepositoryProvider } from './providers/FraudCheckRepositoryProvider';

import { FraudExampleAction } from './actions/FraudExampleAction';

@serviceProvider({
  config: __dirname,
  providers: [FraudCheckRepositoryProvider],
  validator: [],
  middlewares: [['validate', ValidatorMiddleware], ['channel.transport', ChannelTransportMiddleware]],
  connections: [[RedisConnection, 'connections.redis'], [PostgresConnection, 'connections.postgres']],
  handlers: [FraudExampleAction],
  queues: ['fraud'],
})
export class ServiceProvider extends AbstractServiceProvider {}
