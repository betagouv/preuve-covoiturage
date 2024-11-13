import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { GeoProviderInterfaceResolver } from "@/pdc/providers/geo/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "@/pdc/services/geo/contracts/getRouteMeta.contract.ts";
import { alias } from "@/pdc/services/geo/contracts/getRouteMeta.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("common.geo.find"), [
    "validate",
    alias,
  ]],
})
export class GetRouteMetaAction extends AbstractAction {
  constructor(private provider: GeoProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.provider.getRouteMeta(params.start, params.end);
  }
}
