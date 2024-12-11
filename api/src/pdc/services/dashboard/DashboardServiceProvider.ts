/* eslint-disable max-len */
import { ExtensionInterface, NewableType, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { ValidatorExtension, ValidatorMiddleware } from "@/pdc/providers/validator/index.ts";
import { CampaignsAction } from "@/pdc/services/dashboard/actions/CampaignsAction.ts";
import { IncentiveByDayAction } from "@/pdc/services/dashboard/actions/IncentiveByDayAction.ts";
import { OperatorsByDayAction } from "@/pdc/services/dashboard/actions/OperatorsByDayAction.ts";
import { TerritoriesAction } from "@/pdc/services/dashboard/actions/TerritoriesAction.ts";
import { CampaignsRepositoryProvider } from "@/pdc/services/dashboard/providers/CampaignsRepositoryProvider.ts";
import { IncentiveRepositoryProvider } from "@/pdc/services/dashboard/providers/IncentiveRepositoryProvider.ts";
import { TerritoriesRepositoryProvider } from "@/pdc/services/dashboard/providers/TerritoriesRepositoryProvider.ts";
import { IncentiveByMonthAction } from "./actions/IncentiveByMonthAction.ts";
import { OperatorsByMonthAction } from "./actions/OperatorsByMonthAction.ts";
import { config } from "./config/index.ts";
import { binding as CampaignsBinding } from "./contracts/campaigns/campaigns.schema.ts";
import { binding as IncentiveByDayBinding } from "./contracts/incentive/incentiveByDay.schema.ts";
import { binding as IncentiveByMonthBinding } from "./contracts/incentive/incentiveByMonth.schema.ts";
import { binding as OperatorsByDayBinding } from "./contracts/operators/operatorsByDay.schema.ts";
import { binding as OperatorsByMonthBinding } from "./contracts/operators/operatorsByMonth.schema.ts";
import { binding as TerritoriesBinding } from "./contracts/territories/territories.schema.ts";
import { OperatorsRepositoryProvider } from "./providers/OperatorsRepositoryProvider.ts";

/* eslint-enable */
@serviceProvider({
  config,
  commands: [],
  providers: [
    OperatorsRepositoryProvider,
    IncentiveRepositoryProvider,
    CampaignsRepositoryProvider,
    TerritoriesRepositoryProvider,
  ],
  validator: [
    OperatorsByMonthBinding,
    OperatorsByDayBinding,
    IncentiveByMonthBinding,
    IncentiveByDayBinding,
    CampaignsBinding,
    TerritoriesBinding,
  ],
  handlers: [
    OperatorsByMonthAction,
    OperatorsByDayAction,
    IncentiveByMonthAction,
    IncentiveByDayAction,
    CampaignsAction,
    TerritoriesAction,
  ],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
})
export class DashboardServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
