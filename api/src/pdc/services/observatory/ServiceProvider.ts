/* eslint-disable max-len */
import {
  ExtensionInterface,
  NewableType,
  serviceProvider,
} from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import {
  ValidatorExtension,
  ValidatorMiddleware,
} from "@/pdc/providers/validator/index.ts";
import { InsertLastMonthDistributionAction } from "@/pdc/services/observatory/actions/distribution/InsertLastMonthDistributionAction.ts";
import { JourneysByDistancesAction } from "@/pdc/services/observatory/actions/distribution/JourneysByDistancesAction.ts";
import { JourneysByHoursAction } from "@/pdc/services/observatory/actions/distribution/JourneysByHoursAction.ts";
import { RefreshAllDistributionAction } from "@/pdc/services/observatory/actions/distribution/RefreshAllDistributionAction.ts";
import { BestFluxAction } from "@/pdc/services/observatory/actions/flux/BestFluxAction.ts";
import { EvolFluxAction } from "@/pdc/services/observatory/actions/flux/EvolFluxAction.ts";
import { FluxAction } from "@/pdc/services/observatory/actions/flux/FluxAction.ts";
import { CampaignsAction } from "@/pdc/services/observatory/actions/incentiveCampaigns/CampaignsAction.ts";
import { AiresCovoiturageAction } from "@/pdc/services/observatory/actions/infra/AiresCovoiturageAction.ts";
import { MonthlyKeyfiguresAction } from "@/pdc/services/observatory/actions/keyfigures/MonthlyKeyfiguresAction.ts";
import { LocationAction } from "@/pdc/services/observatory/actions/location/LocationAction.ts";
import { binding as JourneysByDistancesBinding } from "@/shared/observatory/distribution/journeysByDistances.schema.ts";
import { binding as JourneysByHoursBinding } from "@/shared/observatory/distribution/journeysByHours.schema.ts";
import { binding as GetBestFluxBinding } from "@/shared/observatory/flux/getBestFlux.schema.ts";
import { binding as GetEvolFluxBinding } from "@/shared/observatory/flux/getEvolFlux.schema.ts";
import { binding as GetFluxBinding } from "@/shared/observatory/flux/getFlux.schema.ts";
import { binding as CampaignsBinding } from "@/shared/observatory/incentiveCampaigns/campaigns.schema.ts";
import { binding as AiresCovoiturageBinding } from "@/shared/observatory/infra/airesCovoiturage.schema.ts";
import { binding as MonthlyKeyfiguresBinding } from "@/shared/observatory/keyfigures/monthlyKeyfigures.schema.ts";
import { binding as LocationBinding } from "@/shared/observatory/location/location.schema.ts";
import { binding as BestMonthlyTerritoriesBinding } from "@/shared/observatory/occupation/bestMonthlyTerritories.schema.ts";
import { binding as EvolMonthlyOccupationBinding } from "@/shared/observatory/occupation/evolMonthlyOccupation.schema.ts";
import { binding as MonthlyOccupationBinding } from "@/shared/observatory/occupation/monthlyOccupation.schema.ts";
import { binding as TerritoriesListBinding } from "@/shared/observatory/territories/list.schema.ts";
import { binding as TerritoryNameBinding } from "@/shared/observatory/territories/name.schema.ts";
import { BestMonthlyTerritoriesAction } from "./actions/occupation/BestMonthlyTerritoriesAction.ts";
import { EvolMonthlyOccupationAction } from "./actions/occupation/EvolMonthlyOccupationAction.ts";
import { InsertLastMonthOccupationAction } from "./actions/occupation/InsertLastMonthOccupationAction.ts";
import { MonthlyOccupationAction } from "./actions/occupation/MonthlyOccupationAction.ts";
import { RefreshAllOccupationAction } from "./actions/occupation/RefreshAllOccupationAction.ts";
import { TerritoriesListAction } from "./actions/territories/TerritoriesListAction.ts";
import { TerritoryNameAction } from "./actions/territories/TerritoryNameAction.ts";
import { InsertCommand } from "./commands/InsertCommand.ts";
import { config } from "./config/index.ts";
import { DistributionRepositoryProvider } from "./providers/DistributionRepositoryProvider.ts";
import { FluxRepositoryProvider } from "./providers/FluxRepositoryProvider.ts";
import { IncentiveCampaignsRepositoryProvider } from "./providers/IncentiveCampaignsRepositoryProvider.ts";
import { InfraRepositoryProvider } from "./providers/InfraRepositoryProvider.ts";
import { KeyfiguresRepositoryProvider } from "./providers/KeyfiguresRepositoryProvider.ts";
import { LocationRepositoryProvider } from "./providers/LocationRepositoryProvider.ts";
import { OccupationRepositoryProvider } from "./providers/OccupationRepositoryProvider.ts";
import { TerritoriesRepositoryProvider } from "./providers/TerritoriesRepositoryProvider.ts";

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
    GetBestFluxBinding,
    BestMonthlyTerritoriesBinding,
    GetEvolFluxBinding,
    EvolMonthlyOccupationBinding,
    JourneysByDistancesBinding,
    JourneysByHoursBinding,
    LocationBinding,
    GetFluxBinding,
    MonthlyKeyfiguresBinding,
    MonthlyOccupationBinding,
    TerritoriesListBinding,
    TerritoryNameBinding,
    CampaignsBinding,
  ],
  handlers: [
    AiresCovoiturageAction,
    BestFluxAction,
    BestMonthlyTerritoriesAction,
    EvolFluxAction,
    EvolMonthlyOccupationAction,
    InsertLastMonthDistributionAction,
    InsertLastMonthOccupationAction,
    JourneysByDistancesAction,
    JourneysByHoursAction,
    LocationAction,
    FluxAction,
    MonthlyKeyfiguresAction,
    MonthlyOccupationAction,
    RefreshAllDistributionAction,
    RefreshAllOccupationAction,
    TerritoriesListAction,
    TerritoryNameAction,
    CampaignsAction,
  ],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
  queues: ["observatory"],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
