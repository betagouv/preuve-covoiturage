/* eslint-disable max-len */
import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { InsertLastMonthDistributionAction } from './actions/distribution/InsertLastMonthDistributionAction';
import { JourneysByDistancesAction } from './actions/distribution/JourneysByDistancesAction';
import { JourneysByHoursAction } from './actions/distribution/JourneysByHoursAction';
import { RefreshAllDistributionAction } from './actions/distribution/RefreshAllDistributionAction';
import { BestMonthlyFluxAction } from './actions/flux/BestMonthlyFluxAction';
import { EvolMonthlyFluxAction } from './actions/flux/EvolMonthlyFluxAction';
import { InsertLastMonthFluxAction } from './actions/flux/InsertLastMonthFluxAction';
import { LastRecordMonthlyFluxAction } from './actions/flux/LastRecordMonthlyFluxAction';
import { MonthlyFluxAction } from './actions/flux/MonthlyFluxAction';
import { RefreshAllFluxAction } from './actions/flux/RefreshAllFluxAction';
import { AiresCovoiturageAction } from './actions/infra/AiresCovoiturageAction';
import { MonthlyKeyfiguresAction } from './actions/keyfigures/MonthlyKeyfiguresAction';
import { LocationAction } from './actions/location/LocationAction';
import { BestMonthlyTerritoriesAction } from './actions/occupation/BestMonthlyTerritoriesAction';
import { EvolMonthlyOccupationAction } from './actions/occupation/EvolMonthlyOccupationAction';
import { InsertLastMonthOccupationAction } from './actions/occupation/InsertLastMonthOccupationAction';
import { MonthlyOccupationAction } from './actions/occupation/MonthlyOccupationAction';
import { RefreshAllOccupationAction } from './actions/occupation/RefreshAllOccupationAction';
import { TerritoriesListAction } from './actions/territories/TerritoriesListAction';
import { TerritoryNameAction } from './actions/territories/TerritoryNameAction';
import { InsertCommand } from './commands/InsertCommand';
import { config } from './config';
import { DistributionRepositoryProvider } from './providers/DistributionRepositoryProvider';
import { FluxRepositoryProvider } from './providers/FluxRepositoryProvider';
import { InfraRepositoryProvider } from './providers/InfraRepositoryProvider';
import { KeyfiguresRepositoryProvider } from './providers/KeyfiguresRepositoryProvider';
import { LocationRepositoryProvider } from './providers/LocationRepositoryProvider';
import { OccupationRepositoryProvider } from './providers/OccupationRepositoryProvider';
import { TerritoriesRepositoryProvider } from './providers/TerritoriesRepositoryProvider';
import { binding as JourneysByDistancesBinding } from '@shared/observatory/distribution/journeysByDistances.schema';
import { binding as JourneysByHoursBinding } from '@shared/observatory/distribution/journeysByHours.schema';
import { binding as BestMonthlyFluxBinding } from '@shared/observatory/flux/bestMonthlyFlux.schema';
import { binding as EvolMonthlyFluxBinding } from '@shared/observatory/flux/evolMonthlyFlux.schema';
import { binding as MonthlyFluxBinding } from '@shared/observatory/flux/monthlyFlux.schema';
import { binding as AiresCovoiturageBinding } from '@shared/observatory/infra/airesCovoiturage.schema';
import { binding as MonthlyKeyfiguresBinding } from '@shared/observatory/keyfigures/monthlyKeyfigures.schema';
import { binding as LocationBinding } from '@shared/observatory/location/location.schema';
import { binding as BestMonthlyTerritoriesBinding } from '@shared/observatory/occupation/bestMonthlyTerritories.schema';
import { binding as EvolMonthlyOccupationBinding } from '@shared/observatory/occupation/evolMonthlyOccupation.schema';
import { binding as MonthlyOccupationBinding } from '@shared/observatory/occupation/monthlyOccupation.schema';
import { binding as TerritoriesListBinding } from '@shared/observatory/territories/list.schema';
import { binding as TerritoryNameBinding } from '@shared/observatory/territories/name.schema';
/* eslint-enable */

@serviceProvider({
  config,
  commands: [InsertCommand],
  providers: [
    DistributionRepositoryProvider,
    FluxRepositoryProvider,
    InfraRepositoryProvider,
    KeyfiguresRepositoryProvider,
    LocationRepositoryProvider,
    OccupationRepositoryProvider,
    TerritoriesRepositoryProvider,
  ],
  validator: [
    AiresCovoiturageBinding,
    BestMonthlyFluxBinding,
    BestMonthlyTerritoriesBinding,
    EvolMonthlyFluxBinding,
    EvolMonthlyOccupationBinding,
    JourneysByDistancesBinding,
    JourneysByHoursBinding,
    LocationBinding,
    MonthlyFluxBinding,
    MonthlyKeyfiguresBinding,
    MonthlyOccupationBinding,
    TerritoriesListBinding,
    TerritoryNameBinding,
  ],
  handlers: [
    AiresCovoiturageAction,
    BestMonthlyFluxAction,
    BestMonthlyTerritoriesAction,
    EvolMonthlyFluxAction,
    EvolMonthlyOccupationAction,
    InsertLastMonthDistributionAction,
    InsertLastMonthFluxAction,
    InsertLastMonthOccupationAction,
    JourneysByDistancesAction,
    JourneysByHoursAction,
    LastRecordMonthlyFluxAction,
    LocationAction,
    MonthlyFluxAction,
    MonthlyKeyfiguresAction,
    MonthlyOccupationAction,
    RefreshAllDistributionAction,
    RefreshAllFluxAction,
    RefreshAllOccupationAction,
    TerritoriesListAction,
    TerritoryNameAction,
  ],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  queues: ['observatory'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
