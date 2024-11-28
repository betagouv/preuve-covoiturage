import { ExtensionInterface, NewableType, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { GeoProvider } from "@/pdc/providers/geo/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { ValidatorExtension, ValidatorMiddleware } from "@/pdc/providers/validator/index.ts";
import { config } from "./config/index.ts";

import { binding as getPointByAddressBinding } from "@/pdc/services/geo/contracts/getPointByAddress.schema.ts";
import { binding as getPointByCodeBinding } from "@/pdc/services/geo/contracts/getPointByCode.schema.ts";
import { binding as getRouteMeta } from "@/pdc/services/geo/contracts/getRouteMeta.schema.ts";

import { GetPointByAddressAction } from "./actions/GetPointByAddressAction.ts";
import { GetPointByCodeAction } from "./actions/GetPointByCodeAction.ts";
import { GetRouteMetaAction } from "./actions/GetRouteMetaAction.ts";

@serviceProvider({
  config,
  providers: [GeoProvider],
  validator: [getPointByAddressBinding, getPointByCodeBinding, getRouteMeta],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
  handlers: [GetPointByAddressAction, GetPointByCodeAction, GetRouteMetaAction],
})
export class GeoServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
