/* eslint-disable max-len */
import { ExtensionInterface, NewableType, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { S3StorageProvider } from "@/pdc/providers/storage/index.ts";
import { ValidatorExtension, ValidatorMiddleware } from "@/pdc/providers/validator/index.ts";
import { CampaignApdfAction } from "@/pdc/services/dashboard/actions/CampaignApdfAction.ts";
import { CampaignsAction } from "@/pdc/services/dashboard/actions/CampaignsAction.ts";
import { IncentiveByDayAction } from "@/pdc/services/dashboard/actions/IncentiveByDayAction.ts";
import { OperatorsAction } from "@/pdc/services/dashboard/actions/OperatorsAction.ts";
import { OperatorsByDayAction } from "@/pdc/services/dashboard/actions/OperatorsByDayAction.ts";
import { TerritoriesAction } from "@/pdc/services/dashboard/actions/TerritoriesAction.ts";
import { UsersAction } from "@/pdc/services/dashboard/actions/UsersAction.ts";
import { CampaignsRepositoryProvider } from "@/pdc/services/dashboard/providers/CampaignsRepositoryProvider.ts";
import { IncentiveRepositoryProvider } from "@/pdc/services/dashboard/providers/IncentiveRepositoryProvider.ts";
import { IncentiveByMonthAction } from "./actions/IncentiveByMonthAction.ts";
import { OperatorsByMonthAction } from "./actions/OperatorsByMonthAction.ts";
import { config } from "./config/index.ts";
import { binding as CampaignApdfBinding } from "./contracts/campaigns/campaignApdf.schema.ts";
import { binding as CampaignsBinding } from "./contracts/campaigns/campaigns.schema.ts";
import { binding as IncentiveByDayBinding } from "./contracts/incentive/incentiveByDay.schema.ts";
import { binding as IncentiveByMonthBinding } from "./contracts/incentive/incentiveByMonth.schema.ts";
import { binding as OperatorsBinding } from "./contracts/operators/operators.schema.ts";
import { binding as OperatorsByDayBinding } from "./contracts/operators/operatorsByDay.schema.ts";
import { binding as OperatorsByMonthBinding } from "./contracts/operators/operatorsByMonth.schema.ts";
import { binding as TerritoriesBinding } from "./contracts/territories/territories.schema.ts";
import { binding as UsersBinding } from "./contracts/users/users.schema.ts";
import { OperatorsRepositoryProvider } from "./providers/OperatorsRepositoryProvider.ts";
import { UsersRepositoryProvider } from "./providers/UsersRepositoryProvider.ts";

/* eslint-enable */
@serviceProvider({
  config,
  commands: [],
  providers: [
    S3StorageProvider,
    OperatorsRepositoryProvider,
    IncentiveRepositoryProvider,
    CampaignsRepositoryProvider,
    UsersRepositoryProvider,
  ],
  validator: [
    OperatorsBinding,
    OperatorsByMonthBinding,
    OperatorsByDayBinding,
    IncentiveByMonthBinding,
    IncentiveByDayBinding,
    CampaignsBinding,
    CampaignApdfBinding,
    TerritoriesBinding,
    UsersBinding,
  ],
  handlers: [
    OperatorsByMonthAction,
    OperatorsByDayAction,
    IncentiveByMonthAction,
    IncentiveByDayAction,
    CampaignsAction,
    CampaignApdfAction,
    TerritoriesAction,
    OperatorsAction,
    UsersAction,
  ],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
})
export class DashboardServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
