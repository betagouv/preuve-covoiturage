import { serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";

import { config } from "./config/index.ts";

import { DeleteCeeAction } from "./actions/DeleteCeeAction.ts";
import { FindCeeAction } from "./actions/FindCeeAction.ts";
import { RegisterCeeAction } from "./actions/RegisterCeeAction.ts";
import { SimulateCeeAction } from "./actions/SimulateCeeAction.ts";

import { ValidatorMiddleware } from "@/pdc/providers/superstruct/ValidatorMiddleware.ts";
import { CeeRepositoryProvider } from "./providers/CeeRepositoryProvider.ts";

@serviceProvider({
  config,
  providers: [CeeRepositoryProvider],
  handlers: [
    RegisterCeeAction,
    SimulateCeeAction,
    FindCeeAction,
    DeleteCeeAction,
  ],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
})
export class CeeServiceProvider extends AbstractServiceProvider {}
