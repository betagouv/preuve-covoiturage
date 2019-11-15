import { serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorMiddleware } from '@pdc/provider-validator';
import { ChannelTransportMiddleware } from '@pdc/provider-middleware';
import { GeoProvider } from '@pdc/provider-geo';

import { FraudCheckRepositoryProvider } from './providers/FraudCheckRepositoryProvider';

import { FraudCheckAction } from './actions/FraudCheckAction';
import { CheckEngine } from './engine/CheckEngine';

@serviceProvider({
  config: __dirname,
  providers: [FraudCheckRepositoryProvider, GeoProvider, CheckEngine],
  validator: [],
  middlewares: [['validate', ValidatorMiddleware], ['channel.transport', ChannelTransportMiddleware]],
  connections: [[RedisConnection, 'connections.redis'], [PostgresConnection, 'connections.postgres']],
  handlers: [FraudCheckAction],
  queues: ['fraud'],
})
export class ServiceProvider extends AbstractServiceProvider {}
