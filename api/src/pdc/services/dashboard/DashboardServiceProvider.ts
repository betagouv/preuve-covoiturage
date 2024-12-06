/* eslint-disable max-len */
import { ExtensionInterface, NewableType, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { ValidatorExtension, ValidatorMiddleware } from "@/pdc/providers/validator/index.ts";
import { OperatorsAction } from "@/pdc/services/dashboard/actions/OperatorsAction.ts";
import { config } from "./config/index.ts";
import { binding as OperatorsByMonthBinding } from "./contracts/operators/operatorsByMonth.schema.ts";
import { OperatorsRepositoryProvider } from "./providers/OperatorsRepositoryProvider.ts";

/* eslint-enable */
@serviceProvider({
  config,
  commands: [],
  providers: [
    OperatorsRepositoryProvider,
  ],
  validator: [
    OperatorsByMonthBinding,
  ],
  handlers: [
    OperatorsAction,
  ],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
})
export class DashboardServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
