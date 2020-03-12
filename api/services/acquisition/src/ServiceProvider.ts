import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@pdc/provider-acl';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ChannelServiceWhitelistMiddleware } from '@pdc/provider-middleware';

import { config } from './config';
import { schema as create } from './shared/acquisition/create.schema';
import { schema as createLegacy } from './shared/acquisition/createLegacy.schema';
import { schema as logerror } from './shared/acquisition/logerror.schema';
import { schema as cancel } from './shared/acquisition/cancel.schema';
import { schema as resolveerror } from './shared/acquisition/resolveerror.schema';
import { schema as searcherrors } from './shared/acquisition/searcherrors.schema';
import { schema as summaryerrors } from './shared/acquisition/summaryerrors.schema';
import { schema as statuserrors } from './shared/acquisition/status.schema';
import { JourneyPgRepositoryProvider } from './providers/JourneyPgRepositoryProvider';
import { ErrorPgRepositoryProvider } from './providers/ErrorPgRepositoryProvider';
import { CreateJourneyLegacyAction } from './actions/CreateJourneyLegacyAction';
import { CreateJourneyAction } from './actions/CreateJourneyAction';
import { LogErrorAction } from './actions/LogErrorAction';
import { LogRequestAction } from './actions/LogRequestAction';
import { CancelJourneyAction } from './actions/CancelJourneyAction';
import { ResolveErrorAction } from './actions/ResolveErrorAction';
import { SearchErrorAction } from './actions/SearchErrorAction';
import { SummaryErrorAction } from './actions/SummaryErrorAction';
import { StatusAction } from './actions/StatusAction';

@serviceProvider({
  config,
  queues: ['normalization', 'acquisition'],
  providers: [JourneyPgRepositoryProvider, ErrorPgRepositoryProvider],
  validator: [
    ['journey.create', create],
    ['journey.createLegacy', createLegacy],
    ['journey.cancel', cancel],
    ['journey.status', statuserrors],
    ['acquisition.logerror', logerror],
    ['acquisition.resolveerror', resolveerror],
    ['acquisition.searcherrors', searcherrors],
    ['acquisition.summaryerrors', summaryerrors],
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
    CreateJourneyLegacyAction,
    CreateJourneyAction,
    LogErrorAction,
    LogRequestAction,
    ResolveErrorAction,
    SearchErrorAction,
    SummaryErrorAction,
    CancelJourneyAction,
    StatusAction,
  ],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
