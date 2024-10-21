import { ExtensionInterface, NewableType, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { ValidatorExtension, ValidatorMiddleware } from "@/pdc/providers/validator/index.ts";

import { binding as createBinding } from "@/shared/application/create.schema.ts";
import { binding as findBinding } from "@/shared/application/find.schema.ts";
import { binding as listBinding } from "@/shared/application/list.schema.ts";
import { binding as revokeBinding } from "@/shared/application/revoke.schema.ts";
import { CreateApplicationAction } from "./actions/CreateApplicationAction.ts";
import { FindApplicationAction } from "./actions/FindApplicationAction.ts";
import { ListApplicationAction } from "./actions/ListApplicationAction.ts";
import { RevokeApplicationAction } from "./actions/RevokeApplicationAction.ts";
import { config } from "./config/index.ts";
import { ApplicationPgRepositoryProvider } from "./providers/ApplicationPgRepositoryProvider.ts";

@serviceProvider({
  config,
  providers: [ApplicationPgRepositoryProvider],
  validator: [listBinding, findBinding, createBinding, revokeBinding],
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
export class ApplicationServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
