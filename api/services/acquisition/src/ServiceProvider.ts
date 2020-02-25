import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@pdc/package-acl';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ChannelServiceWhitelistMiddleware } from '@pdc/provider-middleware';

import { config } from './config';
import { create } from './shared/acquisition/create.schema';
import { createLegacy } from './shared/acquisition/createLegacy.schema';
import { logerror } from './shared/acquisition/logerror.schema';
import { JourneyPgRepositoryProvider } from './providers/JourneyPgRepositoryProvider';
import { ErrorPgRepositoryProvider } from './providers/ErrorPgRepositoryProvider';
import { CreateJourneyLegacyAction } from './actions/CreateJourneyLegacyAction';
import { CreateJourneyAction } from './actions/CreateJourneyAction';
import { LogErrorAction } from './actions/LogErrorAction';

@serviceProvider({
  config,
  queues: ['normalization', 'acquisition'],
  providers: [JourneyPgRepositoryProvider, ErrorPgRepositoryProvider],
  validator: [
    ['journey.createLegacy', createLegacy],
    ['journey.create', create],
    ['acquisition.logerror', logerror],
  ],
  middlewares: [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
    ['channel.service.only', ChannelServiceWhitelistMiddleware],
  ],
  connections: [
    [PostgresConnection, 'connections.postgres'],
    [RedisConnection, 'connections.redis'],
  ],
  handlers: [CreateJourneyLegacyAction, CreateJourneyAction, LogErrorAction],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
