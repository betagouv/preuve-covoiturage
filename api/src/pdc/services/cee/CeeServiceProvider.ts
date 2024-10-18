import { ExtensionInterface, NewableType, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { ValidatorExtension, ValidatorMiddleware } from "@/pdc/providers/validator/index.ts";

import { binding as deleteCeeBinding } from "@/shared/cee/deleteApplication.schema.ts";
import { binding as findCeeBinding } from "@/shared/cee/findApplication.schema.ts";
import { binding as importCeeBinding } from "@/shared/cee/importApplication.schema.ts";
import { binding as importIdentityCeeBinding } from "@/shared/cee/importApplicationIdentity.schema.ts";
import { binding as registerCeeBinding } from "@/shared/cee/registerApplication.schema.ts";
import { binding as simulateCeeBinding } from "@/shared/cee/simulateApplication.schema.ts";
import { config } from "./config/index.ts";

import { DeleteCeeAction } from "./actions/DeleteCeeAction.ts";
import { FindCeeAction } from "./actions/FindCeeAction.ts";
import { ImportCeeAction } from "./actions/ImportCeeAction.ts";
import { ImportCeeIdentityAction } from "./actions/ImportCeeIdentityAction.ts";
import { RegisterCeeAction } from "./actions/RegisterCeeAction.ts";
import { SimulateCeeAction } from "./actions/SimulateCeeAction.ts";

import { CeeRepositoryProvider } from "./providers/CeeRepositoryProvider.ts";

@serviceProvider({
  config,
  providers: [CeeRepositoryProvider],
  validator: [
    importCeeBinding,
    importIdentityCeeBinding,
    registerCeeBinding,
    simulateCeeBinding,
    findCeeBinding,
    deleteCeeBinding,
  ],
  handlers: [
    ImportCeeAction,
    RegisterCeeAction,
    SimulateCeeAction,
    ImportCeeIdentityAction,
    FindCeeAction,
    DeleteCeeAction,
  ],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
})
export class CeeServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
