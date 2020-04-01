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

import { createLegacy } from './shared/acquisition/createLegacy.schema';
import { create } from './shared/acquisition/create.schema';
import { cancel } from './shared/acquisition/cancel.schema';
import { status } from './shared/acquisition/status.schema';
import { logerror } from './shared/acquisition/logerror.schema';
import { resolveerror } from './shared/acquisition/resolveerror.schema';
import { searcherrors } from './shared/acquisition/searcherrors.schema';
import { summaryerrors } from './shared/acquisition/summaryerrors.schema';

import { CreateJourneyLegacyAction } from './actions/CreateJourneyLegacyAction';
import { CreateJourneyAction } from './actions/CreateJourneyAction';
import { LogErrorAction } from './actions/LogErrorAction';
import { LogRequestAction } from './actions/LogRequestAction';
import { CancelJourneyAction } from './actions/CancelJourneyAction';
import { ResolveErrorAction } from './actions/ResolveErrorAction';
import { SearchErrorAction } from './actions/SearchErrorAction';
import { SummaryErrorAction } from './actions/SummaryErrorAction';
import { StatusJourneyAction } from './actions/StatusJourneyAction';

@serviceProvider({
  config,
  queues: ['normalization', 'acquisition'],
  providers: [JourneyPgRepositoryProvider, ErrorPgRepositoryProvider, CarpoolRepositoryProvider],
  validator: [
    ['journey.createLegacy', createLegacy],
    ['journey.create', create],
    ['journey.cancel', cancel],
    ['journey.status', status],
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
    StatusJourneyAction,
  ],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
