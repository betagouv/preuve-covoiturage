import { ExtensionInterface, NewableType, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { APDFNameProvider } from "@/pdc/providers/storage/index.ts";
import { ValidatorExtension, ValidatorMiddleware } from "@/pdc/providers/validator/index.ts";
import { ApplyAction } from "./actions/ApplyAction.ts";
import { FinalizeAction } from "./actions/FinalizeAction.ts";
import { FindAction } from "./actions/FindAction.ts";
import { GetPastSimulationOrComputeAction } from "./actions/GetPastSimulationOrComputeAction.ts";
import { ListAction } from "./actions/ListAction.ts";
import { SimulateOnFutureAction } from "./actions/SimulateOnFutureAction.ts";
import { SimulateOnPastAction } from "./actions/SimulateOnPastAction.ts";
import { SimulateOnPastByGeoAction } from "./actions/SimulateOnPastByGeoAction.ts";
import { StatsAction } from "./actions/StatsAction.ts";
import { syncIncentiveSumAction } from "./actions/SyncIncentiveSumAction.ts";
import { ApplyCommand } from "./commands/ApplyCommand.ts";
import { FinalizeCommand } from "./commands/FinalizeCommand.ts";
import { StatsCommand } from "./commands/StatsCommand.ts";
import { SyncCommand } from "./commands/SyncCommand.ts";
import { config } from "./config/index.ts";
import { binding as applySchemaBinding } from "./contracts/apply.schema.ts";
import { binding as finalizeSchemaBinding } from "./contracts/finalize.schema.ts";
import { binding as findSchemaBinding } from "./contracts/find.schema.ts";
import { binding as listSchemaBinding } from "./contracts/list.schema.ts";
import { binding as simulateOnFutureSchemaBinding } from "./contracts/simulateOnFuture.schema.ts";
import { binding as simulateOnSchemaBinding } from "./contracts/simulateOnPast.schema.ts";
import { binding as simulateOnPastGeoSchemaBinding } from "./contracts/simulateOnPastGeo.schema.ts";
import { binding as statsSchemaBinding } from "./contracts/stats.schema.ts";
import { binding as syncIncentiveSumSchemaBinding } from "./contracts/syncIncentiveSum.schema.ts";
import { IncentiveRepositoryProvider } from "./providers/IncentiveRepositoryProvider.ts";
import { MetadataRepositoryProvider } from "./providers/MetadataRepositoryProvider.ts";
import { PolicyRepositoryProvider } from "./providers/PolicyRepositoryProvider.ts";
import { TerritoryRepositoryProvider } from "./providers/TerritoryRepositoryProvider.ts";
import { TripRepositoryProvider } from "./providers/TripRepositoryProvider.ts";

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
  commands: [ApplyCommand, FinalizeCommand, StatsCommand, SyncCommand],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
})
export class PolicyServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
