import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';

import { config } from './config';
import { FluxRepositoryProvider } from './providers/FluxRepositoryProvider';
import { binding as MonthlyFluxBinding } from './shared/observatory/flux/monthlyFlux.schema';
import { MonthlyFluxAction } from './actions/flux/MonthlyFluxAction';
import { LastRecordMonthlyFluxAction } from './actions/flux/LastRecordMonthlyFluxAction';
import { InsertLastMonthFluxAction } from './actions/flux/InsertLastMonthFluxAction';
import { RefreshAllFluxAction } from './actions/flux/RefreshAllFluxAction';
import { binding as EvolMonthlyFluxBinding } from './shared/observatory/flux/evolMonthlyFlux.schema';
import { EvolMonthlyFluxAction } from './actions/flux/EvolMonthlyFluxAction';
import { binding as BestMonthlyFluxBinding } from './shared/observatory/flux/bestMonthlyFlux.schema';
import { BestMonthlyFluxAction } from './actions/flux/BestMonthlyFluxAction';

import { OccupationRepositoryProvider } from './providers/OccupationRepositoryProvider';
import { binding as MonthlyOccupationBinding } from './shared/observatory/occupation/monthlyOccupation.schema';
import { MonthlyOccupationAction } from './actions/occupation/MonthlyOccupationAction';
import { InsertLastMonthOccupationAction } from './actions/occupation/InsertLastMonthOccupationAction';
import { RefreshAllOccupationAction } from './actions/occupation/RefreshAllOccupationAction';
import { binding as EvolMonthlyOccupationBinding } from './shared/observatory/occupation/evolMonthlyOccupation.schema';
import { EvolMonthlyOccupationAction } from './actions/occupation/EvolMonthlyOccupationAction';
import { binding as BestMonthlyTerritoriesBinding } from './shared/observatory/occupation/bestMonthlyTerritories.schema';
import { BestMonthlyTerritoriesAction } from './actions/occupation/BestMonthlyTerritoriesAction';

import { TerritoriesRepositoryProvider } from './providers/TerritoriesRepositoryProvider';
import { binding as TerritoriesListBinding } from './shared/observatory/territories/list.schema';
import { TerritoriesListAction } from './actions/territories/TerritoriesListAction';
import { binding as TerritoryNameBinding } from './shared/observatory/territories/name.schema';
import { TerritoryNameAction } from './actions/territories/TerritoryNameAction';

@serviceProvider({
  config,
  commands: [],
  providers: [
    FluxRepositoryProvider,
    OccupationRepositoryProvider,
    TerritoriesRepositoryProvider,
  ],
  validator: [
    MonthlyFluxBinding,
    EvolMonthlyFluxBinding,
    BestMonthlyFluxBinding,

    MonthlyOccupationBinding,
    EvolMonthlyOccupationBinding,
    BestMonthlyTerritoriesBinding,

    TerritoriesListBinding,
    TerritoryNameBinding,
  ],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  handlers: [
    MonthlyFluxAction,
    InsertLastMonthFluxAction,
    RefreshAllFluxAction,
    EvolMonthlyFluxAction,
    LastRecordMonthlyFluxAction,
    BestMonthlyFluxAction,
    
    MonthlyOccupationAction,
    InsertLastMonthOccupationAction,
    RefreshAllOccupationAction,
    EvolMonthlyOccupationAction,
    BestMonthlyTerritoriesAction,

    TerritoriesListAction,
    TerritoryNameAction,
  ],
  queues: ['observatory']
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
