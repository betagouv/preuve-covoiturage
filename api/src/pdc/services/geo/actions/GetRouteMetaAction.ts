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
  apiRoute: {
    path: "/geo/route",
    action: "geo:getRouteMeta",
    method: "GET",
    rateLimiter: {
      key: "rl-acquisition-check",
      limit: 2_000,
      windowMinute: 1,
    },
    async actionParamsFn(req) {
      const q = { ...req.query };
      q.start = {
        lat: parseFloat(q.start?.lat),
        lon: parseFloat(q.start?.lon),
      };
      q.end = {
        lat: parseFloat(q.end?.lat),
        lon: parseFloat(q.end?.lon),
      };
      return q;
    },
    rpcAnswerOnFailure: true,
  },
})
export class GetRouteMetaAction extends AbstractAction {
  constructor(private provider: GeoProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.provider.getRouteMeta(params.start, params.end);
  }
}
