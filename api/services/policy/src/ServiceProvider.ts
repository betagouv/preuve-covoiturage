import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';

import { config } from './config';
import { binding as listSchemaBinding } from './shared/policy/list.schema';
import { binding as findSchemaBinding } from './shared/policy/find.schema';
import { binding as simulateOnSchemaBinding } from './shared/policy/simulateOn.schema';
import { binding as simulateOnFutureSchemaBinding } from './shared/policy/simulateOnFuture.schema';

import { ApplyAction } from './actions/ApplyAction';
import { FinalizeAction } from './actions/FinalizeAction';
import { FindCampaignAction } from './actions/FindCampaignAction';
import { ListCampaignAction } from './actions/ListCampaignAction';
import { SimulateOnPastAction } from './actions/SimulateOnPastAction';
import { SimulateOnFutureAction } from './actions/SimulateOnFutureAction';

import { CampaignPgRepositoryProvider } from './providers/CampaignPgRepositoryProvider';
import { PolicyEngine } from './engine/PolicyEngine';
import { MetadataRepositoryProvider } from './providers/MetadataRepositoryProvider';
import { IncentiveRepositoryProvider } from './providers/IncentiveRepositoryProvider';
import { TripRepositoryProvider } from './providers/TripRepositoryProvider';
import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';

@serviceProvider({
  config,
  providers: [
    CampaignPgRepositoryProvider,
    MetadataRepositoryProvider,
    TripRepositoryProvider,
    PolicyEngine,
    IncentiveRepositoryProvider,
    TerritoryRepositoryProvider,
  ],
  validator: [listSchemaBinding, findSchemaBinding, simulateOnSchemaBinding, simulateOnFutureSchemaBinding],
  handlers: [
    ListCampaignAction,
    FindCampaignAction,
    ApplyAction,
    FinalizeAction,
    SimulateOnPastAction,
    SimulateOnFutureAction,
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
