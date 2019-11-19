import { serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorMiddleware } from '@pdc/provider-validator';
import { ChannelServiceBlacklistMiddleware } from '@pdc/provider-middleware';
import { GeoProvider } from '@pdc/provider-geo';

import { FraudCheckProcessCommand } from './commands/FraudCheckProcessCommand';
import { FraudCheckRepositoryProvider } from './providers/FraudCheckRepositoryProvider';

import { FraudCheckAction } from './actions/FraudCheckAction';
import { CheckEngine } from './engine/CheckEngine';
import { FraudCheckAllAction } from './actions/FraudCheckAllAction';

@serviceProvider({
  config: __dirname,
  commands: [FraudCheckProcessCommand],
  providers: [FraudCheckRepositoryProvider, GeoProvider, CheckEngine],
  validator: [],
  middlewares: [['validate', ValidatorMiddleware], ['channel.service.except', ChannelServiceBlacklistMiddleware]],
  connections: [[RedisConnection, 'connections.redis'], [PostgresConnection, 'connections.postgres']],
  handlers: [FraudCheckAction, FraudCheckAllAction],
  queues: ['fraud'],
})
export class ServiceProvider extends AbstractServiceProvider {}
