/* eslint-disable max-len */
import { ExtensionInterface, NewableType, serviceProvider } from '@/ilos/common/index.ts';
import { ServiceProvider as AbstractServiceProvider } from '@/ilos/core/index.ts';
import { defaultMiddlewareBindings } from '@/pdc/providers/middleware/index.ts';
import { ValidatorExtension, ValidatorMiddleware } from '@/pdc/providers/validator/index.ts';
import { InsertLastMonthDistributionAction } from './actions/distribution/InsertLastMonthDistributionAction.ts';
import { JourneysByDistancesAction } from './actions/distribution/JourneysByDistancesAction.ts';
import { JourneysByHoursAction } from './actions/distribution/JourneysByHoursAction.ts';
import { RefreshAllDistributionAction } from './actions/distribution/RefreshAllDistributionAction.ts';
import { BestMonthlyFluxAction } from './actions/flux/BestMonthlyFluxAction.ts';
import { EvolMonthlyFluxAction } from './actions/flux/EvolMonthlyFluxAction.ts';
import { InsertLastMonthFluxAction } from './actions/flux/InsertLastMonthFluxAction.ts';
import { LastRecordMonthlyFluxAction } from './actions/flux/LastRecordMonthlyFluxAction.ts';
import { MonthlyFluxAction } from './actions/flux/MonthlyFluxAction.ts';
import { RefreshAllFluxAction } from './actions/flux/RefreshAllFluxAction.ts';
import { AiresCovoiturageAction } from './actions/infra/AiresCovoiturageAction.ts';
import { MonthlyKeyfiguresAction } from './actions/keyfigures/MonthlyKeyfiguresAction.ts';
import { LocationAction } from './actions/location/LocationAction.ts';
import { BestMonthlyTerritoriesAction } from './actions/occupation/BestMonthlyTerritoriesAction.ts';
import { EvolMonthlyOccupationAction } from './actions/occupation/EvolMonthlyOccupationAction.ts';
import { InsertLastMonthOccupationAction } from './actions/occupation/InsertLastMonthOccupationAction.ts';
import { MonthlyOccupationAction } from './actions/occupation/MonthlyOccupationAction.ts';
import { RefreshAllOccupationAction } from './actions/occupation/RefreshAllOccupationAction.ts';
import { TerritoriesListAction } from './actions/territories/TerritoriesListAction.ts';
import { TerritoryNameAction } from './actions/territories/TerritoryNameAction.ts';
import { CampaignsAction } from './actions/incentiveCampaigns/CampaignsAction.ts';
import { InsertCommand } from './commands/InsertCommand.ts';
import { config } from './config/index.ts';
import { DistributionRepositoryProvider } from './providers/DistributionRepositoryProvider.ts';
import { FluxRepositoryProvider } from './providers/FluxRepositoryProvider.ts';
import { InfraRepositoryProvider } from './providers/InfraRepositoryProvider.ts';
import { KeyfiguresRepositoryProvider } from './providers/KeyfiguresRepositoryProvider.ts';
import { LocationRepositoryProvider } from './providers/LocationRepositoryProvider.ts';
import { OccupationRepositoryProvider } from './providers/OccupationRepositoryProvider.ts';
import { TerritoriesRepositoryProvider } from './providers/TerritoriesRepositoryProvider.ts';
import { IncentiveCampaignsRepositoryProvider } from './providers/IncentiveCampaignsRepositoryProvider.ts';
import { binding as JourneysByDistancesBinding } from '@/shared/observatory/distribution/journeysByDistances.schema.ts';
import { binding as JourneysByHoursBinding } from '@/shared/observatory/distribution/journeysByHours.schema.ts';
import { binding as BestMonthlyFluxBinding } from '@/shared/observatory/flux/bestMonthlyFlux.schema.ts';
import { binding as EvolMonthlyFluxBinding } from '@/shared/observatory/flux/evolMonthlyFlux.schema.ts';
import { binding as MonthlyFluxBinding } from '@/shared/observatory/flux/monthlyFlux.schema.ts';
import { binding as AiresCovoiturageBinding } from '@/shared/observatory/infra/airesCovoiturage.schema.ts';
import { binding as MonthlyKeyfiguresBinding } from '@/shared/observatory/keyfigures/monthlyKeyfigures.schema.ts';
import { binding as LocationBinding } from '@/shared/observatory/location/location.schema.ts';
import { binding as BestMonthlyTerritoriesBinding } from '@/shared/observatory/occupation/bestMonthlyTerritories.schema.ts';
import { binding as EvolMonthlyOccupationBinding } from '@/shared/observatory/occupation/evolMonthlyOccupation.schema.ts';
import { binding as MonthlyOccupationBinding } from '@/shared/observatory/occupation/monthlyOccupation.schema.ts';
import { binding as TerritoriesListBinding } from '@/shared/observatory/territories/list.schema.ts';
import { binding as TerritoryNameBinding } from '@/shared/observatory/territories/name.schema.ts';
import { binding as CampaignsBinding } from '@/shared/observatory/incentiveCampaigns/campaigns.schema.ts';
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
    IncentiveCampaignsRepositoryProvider,
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
    CampaignsBinding,
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
    CampaignsAction,
  ],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  queues: ['observatory'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
