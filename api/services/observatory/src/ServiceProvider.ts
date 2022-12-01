import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { binding as statsBinding } from './shared/observatory/monthlyFlux.schema';

import { config } from './config';
import { MonthlyFluxAction } from './actions/MonthlyFluxAction';
import { FluxRepositoryProvider } from './providers/FluxRepositoryProvider';

@serviceProvider({
  config,
  commands: [],
  providers: [FluxRepositoryProvider],
  validator: [statsBinding],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  handlers: [MonthlyFluxAction],
  queues: ['observatory'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
