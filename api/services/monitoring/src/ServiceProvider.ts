import path from 'path';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@pdc/provider-acl';
import { RedisConnection } from '@ilos/connection-redis';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ChannelServiceWhitelistMiddleware } from '@pdc/provider-middleware';
import { NotificationExtension } from '@pdc/provider-notification';
import { TemplateExtension } from '@pdc/provider-template';

import { config } from './config';
import { JourneysStatsAction } from './actions/JourneysStatsAction';
import { JourneysStatsNotifyAction } from './actions/JourneysStatsNotifyAction';
import { JourneysStatsCommand } from './commands/JourneysStatsCommand';
import { JourneyRepositoryProvider } from './providers/JourneyRepositoryProvider';
import { binding as statsBinding } from './shared/monitoring/journeys/stats.schema';

@serviceProvider({
  config,
  providers: [JourneyRepositoryProvider],
  commands: [JourneysStatsCommand],
  validator: [statsBinding],
  middlewares: [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
    ['channel.service.only', ChannelServiceWhitelistMiddleware],
  ],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  handlers: [JourneysStatsAction, JourneysStatsNotifyAction],
  notification: {
    template: path.resolve(__dirname, 'templates'),
    templateMeta: {
      stats: {
        subject: "Statistique d'acquisition",
      },
    },
  },
  queues: ['monitoring'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [
    ValidatorExtension,
    TemplateExtension,
    NotificationExtension,
  ];
}
