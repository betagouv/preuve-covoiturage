import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { defaultNotificationBindings } from '@pdc/provider-notification';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { JourneysStatsAction } from './actions/JourneysStatsAction';
import { JourneysStatsNotifyAction } from './actions/JourneysStatsNotifyAction';
import { StatsRefreshAction } from './actions/StatsRefreshAction';
import { JourneysStatsCommand } from './commands/JourneysStatsCommand';
import { StatsRefreshCommand } from './commands/StatsRefreshCommand';
import { config } from './config';
import { JourneyRepositoryProvider } from './providers/JourneyRepositoryProvider';
import { binding as journeyStatsBinding } from './shared/monitoring/journeystats.schema';
import { binding as statsRefreshBinding } from './shared/monitoring/statsrefresh.schema';

@serviceProvider({
  config,
  providers: [JourneyRepositoryProvider, ...defaultNotificationBindings],
  commands: [JourneysStatsCommand, StatsRefreshCommand],
  validator: [journeyStatsBinding, statsRefreshBinding],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  handlers: [JourneysStatsAction, JourneysStatsNotifyAction, StatsRefreshAction],
  queues: ['monitoring'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
