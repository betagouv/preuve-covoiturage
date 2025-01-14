/* eslint-disable max-len */
import { serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { S3StorageProvider } from "@/pdc/providers/storage/index.ts";
import { ValidatorMiddleware } from "@/pdc/providers/superstruct/ValidatorMiddleware.ts";
import { CampaignApdfAction } from "@/pdc/services/dashboard/actions/CampaignApdfAction.ts";
import { CampaignsAction } from "@/pdc/services/dashboard/actions/CampaignsAction.ts";
import { IncentiveByDayAction } from "@/pdc/services/dashboard/actions/IncentiveByDayAction.ts";
import { OperatorsAction } from "@/pdc/services/dashboard/actions/OperatorsAction.ts";
import { OperatorsByDayAction } from "@/pdc/services/dashboard/actions/OperatorsByDayAction.ts";
import { TerritoriesAction } from "@/pdc/services/dashboard/actions/TerritoriesAction.ts";
import { UsersAction } from "@/pdc/services/dashboard/actions/UsersAction.ts";
import { CampaignsRepositoryProvider } from "@/pdc/services/dashboard/providers/CampaignsRepositoryProvider.ts";
import { IncentiveRepositoryProvider } from "@/pdc/services/dashboard/providers/IncentiveRepositoryProvider.ts";
import { TerritoriesRepositoryProvider } from "@/pdc/services/dashboard/providers/TerritoriesRepositoryProvider.ts";
import { IncentiveByMonthAction } from "./actions/IncentiveByMonthAction.ts";
import { OperatorsByMonthAction } from "./actions/OperatorsByMonthAction.ts";
import { OperatorsRepositoryProvider } from "./providers/OperatorsRepositoryProvider.ts";
import { UsersRepositoryProvider } from "./providers/UsersRepositoryProvider.ts";

/* eslint-enable */
@serviceProvider({
  commands: [],
  providers: [
    S3StorageProvider,
    OperatorsRepositoryProvider,
    IncentiveRepositoryProvider,
    CampaignsRepositoryProvider,
    UsersRepositoryProvider,
    TerritoriesRepositoryProvider,
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
export class DashboardServiceProvider extends AbstractServiceProvider {}
