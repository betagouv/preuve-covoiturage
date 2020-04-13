import { serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorMiddleware } from '@pdc/provider-validator';
import { ChannelServiceBlacklistMiddleware } from '@pdc/provider-middleware';
import { GeoProvider } from '@pdc/provider-geo';

import { config } from './config';
import { FraudCheckProcessCommand } from './commands/FraudCheckProcessCommand';
import { FraudCheckRepositoryProvider } from './providers/FraudCheckRepositoryProvider';
import { ProcessableCarpoolRepositoryProvider } from './providers/ProcessableCarpoolRepositoryProvider';

import { CheckAction } from './actions/CheckAction';
import { CheckEngine } from './engine/CheckEngine';
import { ApplyAction } from './actions/ApplyAction';

@serviceProvider({
  config,
  commands: [FraudCheckProcessCommand],
  providers: [FraudCheckRepositoryProvider, GeoProvider, CheckEngine, ProcessableCarpoolRepositoryProvider],
  validator: [],
  middlewares: [
    ['validate', ValidatorMiddleware],
    ['channel.service.except', ChannelServiceBlacklistMiddleware],
  ],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  handlers: [CheckAction, ApplyAction],
  queues: ['fraudcheck'],
})
export class ServiceProvider extends AbstractServiceProvider {}
