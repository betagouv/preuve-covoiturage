import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { RedisConnection } from '@ilos/connection-redis';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { defaultNotificationBindings } from '@pdc/provider-notification';

import { config } from './config';
import { JourneysStatsAction } from './actions/JourneysStatsAction';
import { JourneysStatsNotifyAction } from './actions/JourneysStatsNotifyAction';
import { JourneysStatsCommand } from './commands/JourneysStatsCommand';
import { JourneyRepositoryProvider } from './providers/JourneyRepositoryProvider';
import { binding as statsBinding } from './shared/monitoring/journeys/stats.schema';

@serviceProvider({
  config,
  providers: [JourneyRepositoryProvider, ...defaultNotificationBindings],
  commands: [JourneysStatsCommand],
  validator: [statsBinding],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  handlers: [JourneysStatsAction, JourneysStatsNotifyAction],
  queues: ['monitoring'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [
    ValidatorExtension,
  ];
}
