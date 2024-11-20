import { serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { CarpoolAcquisitionService } from "@/pdc/providers/carpool/index.ts";
import { CarpoolStatusService } from "@/pdc/providers/carpool/providers/CarpoolStatusService.ts";
import { GeoProvider } from "@/pdc/providers/geo/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { ValidatorMiddleware } from "@/pdc/providers/superstruct/ValidatorMiddleware.ts";
import { CancelJourneyAction } from "./actions/CancelJourneyAction.ts";
import { CreateJourneyAction } from "./actions/CreateJourneyAction.ts";
import { ListJourneyAction } from "./actions/ListJourneyAction.ts";
import { PatchJourneyAction } from "./actions/PatchJourneyAction.ts";
import { StatusJourneyAction } from "./actions/StatusJourneyAction.ts";
import { AcquisitionMigrateCommand } from "./commands/MigrateAcquisitionCommand.ts";
import { ProcessGeoCommand } from "./commands/ProcessGeoCommand.ts";
import { config } from "./config/index.ts";

@serviceProvider({
  config,
  commands: [
    AcquisitionMigrateCommand,
    ProcessGeoCommand,
  ],
  providers: [
    GeoProvider,
    CarpoolAcquisitionService,
    CarpoolStatusService,
  ],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
  handlers: [
    CancelJourneyAction,
    CreateJourneyAction,
    StatusJourneyAction,
    ListJourneyAction,
    PatchJourneyAction,
  ],
})
export class AcquisitionServiceProvider extends AbstractServiceProvider {}
