import { ExtensionInterface, NewableType, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { ValidatorExtension, ValidatorMiddleware } from "@/pdc/providers/validator/index.ts";

import { binding as saveBinding } from "@/shared/honor/save.schema.ts";
import { binding as statsBinding } from "@/shared/honor/stats.schema.ts";
import { SaveAction } from "./actions/SaveAction.ts";
import { StatsAction } from "./actions/StatsAction.ts";
import { config } from "./config/index.ts";
import { HonorRepositoryProvider } from "./providers/HonorRepositoryProvider.ts";

@serviceProvider({
  config,
  providers: [HonorRepositoryProvider],
  validator: [saveBinding, statsBinding],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
  handlers: [StatsAction, SaveAction],
})
export class HonorServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
