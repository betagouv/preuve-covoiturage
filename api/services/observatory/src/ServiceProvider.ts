import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { binding as statsBinding } from './shared/observatory/stats.schema';

import { config } from './config';
import { StatsAction } from './actions/StatsAction';
import { ObservatoryRepositoryProvider } from './providers/ObservatoryRepositoryProvider';




@serviceProvider({
  config,
  commands: [],
  providers: [ObservatoryRepositoryProvider],
  validator: [statsBinding],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  handlers: [StatsAction],
  queues: ['observatory'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
