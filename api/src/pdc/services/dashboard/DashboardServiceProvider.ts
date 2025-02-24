/* eslint-disable max-len */
import { serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { S3StorageProvider } from "@/pdc/providers/storage/index.ts";
import { ValidatorMiddleware } from "@/pdc/providers/superstruct/ValidatorMiddleware.ts";
import { CampaignApdfAction } from "@/pdc/services/dashboard/actions/CampaignApdfAction.ts";
import { CampaignsAction } from "@/pdc/services/dashboard/actions/CampaignsAction.ts";
import { IncentiveByDayAction } from "@/pdc/services/dashboard/actions/IncentiveByDayAction.ts";
import { IncentiveByMonthAction } from "@/pdc/services/dashboard/actions/IncentiveByMonthAction.ts";
import { OperatorsAction } from "@/pdc/services/dashboard/actions/OperatorsAction.ts";
import { OperatorsByDayAction } from "@/pdc/services/dashboard/actions/OperatorsByDayAction.ts";
import { OperatorsByMonthAction } from "@/pdc/services/dashboard/actions/OperatorsByMonthAction.ts";
import { DeleteTerritoryAction } from "@/pdc/services/dashboard/actions/territories/DeleteTerritoryAction.ts";
import { TerritoriesAction } from "@/pdc/services/dashboard/actions/territories/TerritoriesAction.ts";
import { UpdateTerritoryAction } from "@/pdc/services/dashboard/actions/territories/UpdateTerritoryAction.ts";
import { CreateUserAction } from "@/pdc/services/dashboard/actions/users/CreateUserAction.ts";
import { DeleteUserAction } from "@/pdc/services/dashboard/actions/users/DeleteUserAction.ts";
import { UpdateUserAction } from "@/pdc/services/dashboard/actions/users/UpdateUserAction.ts";
import { UserAction } from "@/pdc/services/dashboard/actions/users/UserAction.ts";
import { UsersAction } from "@/pdc/services/dashboard/actions/users/UsersAction.ts";
import { CampaignsRepository } from "@/pdc/services/dashboard/providers/CampaignsRepository.ts";
import { IncentiveRepository } from "@/pdc/services/dashboard/providers/IncentiveRepository.ts";
import { OperatorsRepository } from "@/pdc/services/dashboard/providers/OperatorsRepository.ts";
import { TerritoriesRepository } from "@/pdc/services/dashboard/providers/TerritoriesRepository.ts";
import { UsersRepository } from "@/pdc/services/dashboard/providers/UsersRepository.ts";
import { CreateTerritoryAction } from "@/pdc/services/territory/actions/group/CreateTerritoryAction.ts";

/* eslint-enable */
@serviceProvider({
  commands: [],
  providers: [
    S3StorageProvider,
    OperatorsRepository,
    IncentiveRepository,
    CampaignsRepository,
    UsersRepository,
    TerritoriesRepository,
  ],
  handlers: [
    OperatorsByMonthAction,
    OperatorsByDayAction,
    IncentiveByMonthAction,
    IncentiveByDayAction,
    CampaignsAction,
    CampaignApdfAction,
    TerritoriesAction,
    DeleteTerritoryAction,
    CreateTerritoryAction,
    UpdateTerritoryAction,
    OperatorsAction,
    UserAction,
    UsersAction,
    CreateUserAction,
    UpdateUserAction,
    DeleteUserAction,
  ],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
})
export class DashboardServiceProvider extends AbstractServiceProvider {}
