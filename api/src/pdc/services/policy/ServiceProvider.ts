import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware';
import { APDFNameProvider } from '@pdc/providers/storage';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator';
import { ApplyAction } from './actions/ApplyAction';
import { FinalizeAction } from './actions/FinalizeAction';
import { FindAction } from './actions/FindAction';
import { GetPastSimulationOrComputeAction } from './actions/GetPastSimulationOrComputeAction';
import { ListAction } from './actions/ListAction';
import { SimulateOnFutureAction } from './actions/SimulateOnFutureAction';
import { SimulateOnPastAction } from './actions/SimulateOnPastAction';
import { SimulateOnPastByGeoAction } from './actions/SimulateOnPastByGeoAction';
import { StatsAction } from './actions/StatsAction';
import { syncIncentiveSumAction } from './actions/SyncIncentiveSumAction';
import { ApplyCommand } from './commands/ApplyCommand';
import { FinalizeCommand } from './commands/FinalizeCommand';
import { StatsCommand } from './commands/StatsCommand';
import { config } from './config';
import { IncentiveRepositoryProvider } from './providers/IncentiveRepositoryProvider';
import { MetadataRepositoryProvider } from './providers/MetadataRepositoryProvider';
import { PolicyRepositoryProvider } from './providers/PolicyRepositoryProvider';
import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';
import { TripRepositoryProvider } from './providers/TripRepositoryProvider';
import { binding as applySchemaBinding } from '@shared/policy/apply.schema';
import { binding as finalizeSchemaBinding } from '@shared/policy/finalize.schema';
import { binding as findSchemaBinding } from '@shared/policy/find.schema';
import { binding as listSchemaBinding } from '@shared/policy/list.schema';
import { binding as simulateOnFutureSchemaBinding } from '@shared/policy/simulateOnFuture.schema';
import { binding as simulateOnSchemaBinding } from '@shared/policy/simulateOnPast.schema';
import { binding as simulateOnPastGeoSchemaBinding } from '@shared/policy/simulateOnPastGeo.schema';
import { binding as statsSchemaBinding } from '@shared/policy/stats.schema';
import { binding as syncIncentiveSumSchemaBinding } from '@shared/policy/syncIncentiveSum.schema';

@serviceProvider({
  config,
  providers: [
    APDFNameProvider,
    IncentiveRepositoryProvider,
    MetadataRepositoryProvider,
    PolicyRepositoryProvider,
    TerritoryRepositoryProvider,
    TripRepositoryProvider,
  ],
  validator: [
    applySchemaBinding,
    finalizeSchemaBinding,
    findSchemaBinding,
    listSchemaBinding,
    simulateOnFutureSchemaBinding,
    simulateOnPastGeoSchemaBinding,
    simulateOnSchemaBinding,
    statsSchemaBinding,
    syncIncentiveSumSchemaBinding,
  ],
  handlers: [
    ApplyAction,
    FinalizeAction,
    FindAction,
    GetPastSimulationOrComputeAction,
    ListAction,
    SimulateOnFutureAction,
    SimulateOnPastAction,
    SimulateOnPastByGeoAction,
    StatsAction,
    syncIncentiveSumAction,
  ],
  commands: [ApplyCommand, FinalizeCommand, StatsCommand],
  queues: ['campaign', 'policy'],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
