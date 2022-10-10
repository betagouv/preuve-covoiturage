import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { APDFNameProvider, S3StorageProvider } from '@pdc/provider-file';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';

import { config } from './config';
import { binding as findSchemaBinding } from './shared/policy/find.schema';
import { binding as listSchemaBinding } from './shared/policy/list.schema';
import { binding as simulateOnSchemaBinding } from './shared/policy/simulateOn.schema';
import { binding as simulateOnFutureSchemaBinding } from './shared/policy/simulateOnFuture.schema';
import { binding as statsSchemaBinding } from './shared/policy/stats.schema';

import { ApplyAction } from './actions/ApplyAction';
import { FinalizeAction } from './actions/FinalizeAction';
import { FindAction } from './actions/FindAction';
import { ListAction } from './actions/ListAction';
import { SimulateOnFutureAction } from './actions/SimulateOnFutureAction';
import { SimulateOnPastAction } from './actions/SimulateOnPastAction';
import { StatsAction } from './actions/StatsAction';

import { FundingRequestsListAction } from './actions/FundingRequestsListAction';
import { FundingRequestsRepositoryProvider } from './providers/FundingRequestsRepositoryProvider';
import { IncentiveRepositoryProvider } from './providers/IncentiveRepositoryProvider';
import { MetadataRepositoryProvider } from './providers/MetadataRepositoryProvider';
import { PolicyRepositoryProvider } from './providers/PolicyRepositoryProvider';
import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';
import { TripRepositoryProvider } from './providers/TripRepositoryProvider';

@serviceProvider({
  config,
  providers: [
    APDFNameProvider,
    PolicyRepositoryProvider,
    MetadataRepositoryProvider,
    TripRepositoryProvider,
    IncentiveRepositoryProvider,
    S3StorageProvider,
    TerritoryRepositoryProvider,
    FundingRequestsRepositoryProvider,
  ],
  validator: [
    listSchemaBinding,
    findSchemaBinding,
    simulateOnSchemaBinding,
    simulateOnFutureSchemaBinding,
    statsSchemaBinding,
  ],
  handlers: [
    ApplyAction,
    FinalizeAction,
    FindAction,
    FundingRequestsListAction,
    ListAction,
    SimulateOnFutureAction,
    SimulateOnPastAction,
    StatsAction,
  ],
  connections: [
    [PostgresConnection, 'connections.postgres'],
    [RedisConnection, 'connections.redis'],
  ],
  queues: ['campaign'],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
