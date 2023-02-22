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
import { binding as simulateOnSchemaBinding } from './shared/policy/simulateOnPast.schema';
import { binding as simulateOnPastGeoSchemaBinding } from './shared/policy/simulateOnPastGeo.schema';
import { binding as simulateOnFutureSchemaBinding } from './shared/policy/simulateOnFuture.schema';
import { binding as statsSchemaBinding } from './shared/policy/stats.schema';

import { ApplyAction } from './actions/ApplyAction';
import { FinalizeAction } from './actions/FinalizeAction';
import { FindAction } from './actions/FindAction';
import { ListAction } from './actions/ListAction';
import { SimulateOnFutureAction } from './actions/SimulateOnFutureAction';
import { SimulateOnPastAction } from './actions/SimulateOnPastAction';
import { StatsAction } from './actions/StatsAction';

import { IncentiveRepositoryProvider } from './providers/IncentiveRepositoryProvider';
import { MetadataRepositoryProvider } from './providers/MetadataRepositoryProvider';
import { PolicyRepositoryProvider } from './providers/PolicyRepositoryProvider';
import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';
import { TripRepositoryProvider } from './providers/TripRepositoryProvider';
import { SimulateOnPastByGeoAction } from './actions/SimulateOnPastByGeoAction';
import { GetPastSimulationOrComputeAction } from './actions/GetPastSimulationOrComputeAction';

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
  ],
  validator: [
    listSchemaBinding,
    findSchemaBinding,
    simulateOnSchemaBinding,
    simulateOnFutureSchemaBinding,
    statsSchemaBinding,
    simulateOnPastGeoSchemaBinding,
  ],
  handlers: [
    ApplyAction,
    FinalizeAction,
    FindAction,
    ListAction,
    SimulateOnFutureAction,
    SimulateOnPastAction,
    SimulateOnPastByGeoAction,
    GetPastSimulationOrComputeAction,
    StatsAction,
  ],
  connections: [
    [PostgresConnection, 'connections.postgres'],
    [RedisConnection, 'connections.redis'],
  ],
  queues: ['campaign', 'policy'],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
