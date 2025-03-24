/* eslint-disable max-len */
import { serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { S3StorageProvider } from "@/pdc/providers/storage/index.ts";
import { ValidatorMiddleware } from "@/pdc/providers/superstruct/ValidatorMiddleware.ts";
import { CampaignApdfAction } from "@/pdc/services/dashboard/actions/CampaignApdfAction.ts";
import { CampaignsAction } from "@/pdc/services/dashboard/actions/CampaignsAction.ts";
import { JourneysIncentiveByDayAction } from "@/pdc/services/dashboard/actions/JourneysIncentiveByDayAction.ts";
import { JourneysIncentiveByMonthAction } from "@/pdc/services/dashboard/actions/JourneysIncentiveByMonthAction.ts";
import { JourneysOperatorsByDayAction } from "@/pdc/services/dashboard/actions/JourneysOperatorsByDayAction.ts";
import { JourneysOperatorsByMonthAction } from "@/pdc/services/dashboard/actions/JourneysOperatorsByMonthAction.ts";
import { CreateOperatorAction } from "@/pdc/services/dashboard/actions/operators/CreateOperatorAction.ts";
import { DeleteOperatorAction } from "@/pdc/services/dashboard/actions/operators/DeleteOperatorAction.ts";
import { OperatorAction } from "@/pdc/services/dashboard/actions/operators/OperatorAction.ts";
import { OperatorsAction } from "@/pdc/services/dashboard/actions/operators/OperatorsAction.ts";
import { UpdateOperatorAction } from "@/pdc/services/dashboard/actions/operators/UpdateOperatorAction.ts";
import { CreateTerritoryAction } from "@/pdc/services/dashboard/actions/territories/CreateTerritoryAction.ts";
import { DeleteTerritoryAction } from "@/pdc/services/dashboard/actions/territories/DeleteTerritoryAction.ts";
import { TerritoriesAction } from "@/pdc/services/dashboard/actions/territories/TerritoriesAction.ts";
import { TerritoryAction } from "@/pdc/services/dashboard/actions/territories/TerritoryAction.ts";
import { CreateUserAction } from "@/pdc/services/dashboard/actions/users/CreateUserAction.ts";
import { DeleteUserAction } from "@/pdc/services/dashboard/actions/users/DeleteUserAction.ts";
import { UpdateUserAction } from "@/pdc/services/dashboard/actions/users/UpdateUserAction.ts";
import { UserAction } from "@/pdc/services/dashboard/actions/users/UserAction.ts";
import { UsersAction } from "@/pdc/services/dashboard/actions/users/UsersAction.ts";
import { CampaignsRepository } from "@/pdc/services/dashboard/providers/CampaignsRepository.ts";
import { JourneysRepository } from "@/pdc/services/dashboard/providers/JourneysRepository.ts";
import { OperatorsRepository } from "@/pdc/services/dashboard/providers/OperatorsRepository.ts";
import { TerritoriesRepository } from "@/pdc/services/dashboard/providers/TerritoriesRepository.ts";
import { UsersRepository } from "@/pdc/services/dashboard/providers/UsersRepository.ts";

/* eslint-enable */
@serviceProvider({
  commands: [],
  providers: [
    S3StorageProvider,
    OperatorsRepository,
    JourneysRepository,
    CampaignsRepository,
    UsersRepository,
    TerritoriesRepository,
  ],
  handlers: [
    JourneysOperatorsByMonthAction,
    JourneysOperatorsByDayAction,
    JourneysIncentiveByMonthAction,
    JourneysIncentiveByDayAction,
    CampaignsAction,
    CampaignApdfAction,
    TerritoryAction,
    TerritoriesAction,
    DeleteTerritoryAction,
    CreateTerritoryAction,
    OperatorAction,
    OperatorsAction,
    CreateOperatorAction,
    DeleteOperatorAction,
    UpdateOperatorAction,
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
