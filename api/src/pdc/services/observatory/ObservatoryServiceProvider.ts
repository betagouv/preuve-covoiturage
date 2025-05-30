/* eslint-disable max-len */
import { serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { ValidatorMiddleware } from "@/pdc/providers/superstruct/ValidatorMiddleware.ts";
import { JourneysByDistancesAction } from "@/pdc/services/observatory/actions/distribution/JourneysByDistancesAction.ts";
import { JourneysByHoursAction } from "@/pdc/services/observatory/actions/distribution/JourneysByHoursAction.ts";
import { BestFluxAction } from "@/pdc/services/observatory/actions/flux/BestFluxAction.ts";
import { EvolFluxAction } from "@/pdc/services/observatory/actions/flux/EvolFluxAction.ts";
import { FluxAction } from "@/pdc/services/observatory/actions/flux/FluxAction.ts";
import { IncentiveAction } from "@/pdc/services/observatory/actions/incentive/IncentiveAction.ts";
import { CampaignsAction } from "@/pdc/services/observatory/actions/incentiveCampaigns/CampaignsAction.ts";
import { AiresCovoiturageAction } from "@/pdc/services/observatory/actions/infra/AiresCovoiturageAction.ts";
import { KeyfiguresAction } from "@/pdc/services/observatory/actions/keyfigures/KeyfiguresAction.ts";
import { LocationAction } from "@/pdc/services/observatory/actions/location/LocationAction.ts";
import { BestTerritoriesAction } from "./actions/occupation/BestTerritoriesAction.ts";
import { EvolOccupationAction } from "./actions/occupation/EvolOccupationAction.ts";
import { OccupationAction } from "./actions/occupation/OccupationAction.ts";
import { DistributionRepositoryProvider } from "./providers/DistributionRepositoryProvider.ts";
import { FluxRepositoryProvider } from "./providers/FluxRepositoryProvider.ts";
import { IncentiveCampaignsRepositoryProvider } from "./providers/IncentiveCampaignsRepositoryProvider.ts";
import { IncentiveRepositoryProvider } from "./providers/IncentiveRepositoryProvider.ts";
import { InfraRepositoryProvider } from "./providers/InfraRepositoryProvider.ts";
import { KeyfiguresRepositoryProvider } from "./providers/KeyfiguresRepositoryProvider.ts";
import { LocationRepositoryProvider } from "./providers/LocationRepositoryProvider.ts";
import { OccupationRepositoryProvider } from "./providers/OccupationRepositoryProvider.ts";

/* eslint-enable */
@serviceProvider({
  commands: [],
  providers: [
    DistributionRepositoryProvider,
    FluxRepositoryProvider,
    InfraRepositoryProvider,
    KeyfiguresRepositoryProvider,
    LocationRepositoryProvider,
    OccupationRepositoryProvider,
    IncentiveRepositoryProvider,
    IncentiveCampaignsRepositoryProvider,
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
    IncentiveAction,
    KeyfiguresAction,
    OccupationAction,
    CampaignsAction,
  ],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
})
export class ObservatoryServiceProvider extends AbstractServiceProvider {}
