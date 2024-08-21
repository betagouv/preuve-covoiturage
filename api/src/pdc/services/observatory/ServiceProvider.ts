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
import { JourneysByDistancesAction } from "@/pdc/services/observatory/actions/distribution/JourneysByDistancesAction.ts";
import { JourneysByHoursAction } from "@/pdc/services/observatory/actions/distribution/JourneysByHoursAction.ts";
import { BestFluxAction } from "@/pdc/services/observatory/actions/flux/BestFluxAction.ts";
import { EvolFluxAction } from "@/pdc/services/observatory/actions/flux/EvolFluxAction.ts";
import { FluxAction } from "@/pdc/services/observatory/actions/flux/FluxAction.ts";
import { CampaignsAction } from "@/pdc/services/observatory/actions/incentiveCampaigns/CampaignsAction.ts";
import { AiresCovoiturageAction } from "@/pdc/services/observatory/actions/infra/AiresCovoiturageAction.ts";
import { KeyfiguresAction } from "@/pdc/services/observatory/actions/keyfigures/KeyfiguresAction.ts";
import { LocationAction } from "@/pdc/services/observatory/actions/location/LocationAction.ts";
import { binding as JourneysByDistancesBinding } from "@/shared/observatory/distribution/journeysByDistances.schema.ts";
import { binding as JourneysByHoursBinding } from "@/shared/observatory/distribution/journeysByHours.schema.ts";
import { binding as GetBestFluxBinding } from "@/shared/observatory/flux/getBestFlux.schema.ts";
import { binding as GetEvolFluxBinding } from "@/shared/observatory/flux/getEvolFlux.schema.ts";
import { binding as GetFluxBinding } from "@/shared/observatory/flux/getFlux.schema.ts";
import { binding as CampaignsBinding } from "@/shared/observatory/incentiveCampaigns/campaigns.schema.ts";
import { binding as AiresCovoiturageBinding } from "@/shared/observatory/infra/airesCovoiturage.schema.ts";
import { binding as GetKeyfiguresBinding } from "@/shared/observatory/keyfigures/getKeyfigures.schema.ts";
import { binding as LocationBinding } from "@/shared/observatory/location/location.schema.ts";
import { binding as TerritoriesListBinding } from "@/shared/observatory/territories/list.schema.ts";
import { binding as TerritoryNameBinding } from "@/shared/observatory/territories/name.schema.ts";
import { binding as GetBestTerritoriesBinding } from "../../../shared/observatory/occupation/getBestTerritories.schema.ts";
import { binding as GetEvolOccupationBinding } from "../../../shared/observatory/occupation/getEvolOccupation.schema.ts";
import { binding as GetOccupationBinding } from "../../../shared/observatory/occupation/getOccupation.schema.ts";
import { BestTerritoriesAction } from "./actions/occupation/BestTerritoriesAction.ts";
import { EvolOccupationAction } from "./actions/occupation/EvolOccupationAction.ts";
import { OccupationAction } from "./actions/occupation/OccupationAction.ts";
import { TerritoriesListAction } from "./actions/territories/TerritoriesListAction.ts";
import { TerritoryNameAction } from "./actions/territories/TerritoryNameAction.ts";
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
  commands: [],
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
    GetBestTerritoriesBinding,
    GetEvolFluxBinding,
    GetEvolOccupationBinding,
    JourneysByDistancesBinding,
    JourneysByHoursBinding,
    LocationBinding,
    GetFluxBinding,
    GetKeyfiguresBinding,
    GetOccupationBinding,
    TerritoriesListBinding,
    TerritoryNameBinding,
    CampaignsBinding,
  ],
  handlers: [
    AiresCovoiturageAction,
    BestFluxAction,
    BestTerritoriesAction,
    EvolFluxAction,
    EvolOccupationAction,
    JourneysByDistancesAction,
    JourneysByHoursAction,
    LocationAction,
    FluxAction,
    KeyfiguresAction,
    OccupationAction,
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
