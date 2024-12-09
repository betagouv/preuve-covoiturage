/* eslint-disable max-len */
import { ExtensionInterface, NewableType, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { ValidatorExtension, ValidatorMiddleware } from "@/pdc/providers/validator/index.ts";
import { IncentiveByDayAction } from "@/pdc/services/dashboard/actions/IncentiveByDayAction.ts";
import { OperatorsByDayAction } from "@/pdc/services/dashboard/actions/OperatorsByDayAction.ts";
import { IncentiveRepositoryProvider } from "@/pdc/services/dashboard/providers/IncentiveRepositoryProvider.ts";
import { IncentiveByMonthAction } from "./actions/IncentiveByMonthAction.ts";
import { OperatorsByMonthAction } from "./actions/OperatorsByMonthAction.ts";
import { config } from "./config/index.ts";
import { binding as IncentiveByDayBinding } from "./contracts/incentive/incentiveByDay.schema.ts";
import { binding as IncentiveByMonthBinding } from "./contracts/incentive/incentiveByMonth.schema.ts";
import { binding as OperatorsByDayBinding } from "./contracts/operators/operatorsByDay.schema.ts";
import { binding as OperatorsByMonthBinding } from "./contracts/operators/operatorsByMonth.schema.ts";
import { OperatorsRepositoryProvider } from "./providers/OperatorsRepositoryProvider.ts";

/* eslint-enable */
@serviceProvider({
  config,
  commands: [],
  providers: [
    OperatorsRepositoryProvider,
    IncentiveRepositoryProvider,
  ],
  validator: [
    OperatorsByMonthBinding,
    OperatorsByDayBinding,
    IncentiveByMonthBinding,
    IncentiveByDayBinding,
  ],
  handlers: [
    OperatorsByMonthAction,
    OperatorsByDayAction,
    IncentiveByMonthAction,
    IncentiveByDayAction,
  ],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
})
export class DashboardServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
