import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@pdc/provider-acl';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ChannelServiceWhitelistMiddleware } from '@pdc/provider-middleware';

import { config } from './config';
import { JourneyPgRepositoryProvider } from './providers/JourneyPgRepositoryProvider';
import { ErrorPgRepositoryProvider } from './providers/ErrorPgRepositoryProvider';
import { CarpoolRepositoryProvider } from './providers/CarpoolRepositoryProvider';

import { create } from './shared/acquisition/create.schema';
import { cancel } from './shared/acquisition/cancel.schema';
import { status } from './shared/acquisition/status.schema';
import { logerror } from './shared/acquisition/logerror.schema';
import { resolveerror } from './shared/acquisition/resolveerror.schema';

import { CreateJourneyAction } from './actions/CreateJourneyAction';
import { LogErrorAction } from './actions/LogErrorAction';
import { LogRequestAction } from './actions/LogRequestAction';
import { CancelJourneyAction } from './actions/CancelJourneyAction';
import { ResolveErrorAction } from './actions/ResolveErrorAction';
import { StatusJourneyAction } from './actions/StatusJourneyAction';

@serviceProvider({
  config,
  queues: ['normalization', 'acquisition'],
  providers: [JourneyPgRepositoryProvider, ErrorPgRepositoryProvider, CarpoolRepositoryProvider],
  validator: [
    ['journey.create', create],
    ['journey.cancel', cancel],
    ['journey.status', status],
    ['acquisition.logerror', logerror],
    ['acquisition.resolveerror', resolveerror],
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
  handlers: [
    CreateJourneyAction,
    LogErrorAction,
    LogRequestAction,
    ResolveErrorAction,
    CancelJourneyAction,
    StatusJourneyAction,
  ],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
