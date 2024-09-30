import {
  ExtensionInterface,
  NewableType,
  serviceProvider,
} from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import {
  ValidatorExtension,
  ValidatorMiddleware,
} from "@/pdc/providers/validator/index.ts";

import { binding as crosscheckBinding } from "@/shared/carpool/crosscheck.schema.ts";
import { binding as findIdentitiesBinding } from "@/shared/carpool/findidentities.schema.ts";
import { binding as findUuidBinding } from "@/shared/carpool/finduuid.schema.ts";
import { CrosscheckAction } from "./actions/CrosscheckAction.ts";
import { FindIdentitiesAction } from "./actions/FindIdentitiesAction.ts";
import { FindUuidAction } from "./actions/FindUuidAction.ts";
import { UpdateStatusAction } from "./actions/UpdateStatusAction.ts";
import { config } from "./config/index.ts";

@serviceProvider({
  config,
  providers: [],
  validator: [crosscheckBinding, findUuidBinding, findIdentitiesBinding],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
  handlers: [
    CrosscheckAction,
    FindUuidAction,
    FindIdentitiesAction,
    UpdateStatusAction,
  ],
  queues: ["carpool"],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
