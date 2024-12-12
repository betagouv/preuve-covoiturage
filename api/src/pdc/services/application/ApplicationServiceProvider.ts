import { serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";

import { ValidatorMiddleware } from "@/pdc/providers/superstruct/ValidatorMiddleware.ts";
import { CreateApplicationAction } from "./actions/CreateApplicationAction.ts";
import { FindApplicationAction } from "./actions/FindApplicationAction.ts";
import { ListApplicationAction } from "./actions/ListApplicationAction.ts";
import { RevokeApplicationAction } from "./actions/RevokeApplicationAction.ts";
import { config } from "./config/index.ts";
import { ApplicationPgRepositoryProvider } from "./providers/ApplicationPgRepositoryProvider.ts";

@serviceProvider({
  config,
  providers: [ApplicationPgRepositoryProvider],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
  handlers: [
    ListApplicationAction,
    FindApplicationAction,
    CreateApplicationAction,
    RevokeApplicationAction,
  ],
  commands: [],
})
export class ApplicationServiceProvider extends AbstractServiceProvider {}
