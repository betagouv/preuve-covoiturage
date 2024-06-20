import {
  ExtensionInterface,
  NewableType,
  serviceProvider,
} from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { defaultNotificationBindings } from "@/pdc/providers/notification/index.ts";
import {
  ValidatorExtension,
  ValidatorMiddleware,
} from "@/pdc/providers/validator/index.ts";
import { StatsRefreshAction } from "./actions/StatsRefreshAction.ts";
import { StatsRefreshCommand } from "./commands/StatsRefreshCommand.ts";
import { config } from "./config/index.ts";
import { binding as statsRefreshBinding } from "@/shared/monitoring/statsrefresh.schema.ts";

@serviceProvider({
  config,
  providers: [...defaultNotificationBindings],
  commands: [StatsRefreshCommand],
  validator: [statsRefreshBinding],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
  handlers: [StatsRefreshAction],
  queues: ["monitoring"],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
