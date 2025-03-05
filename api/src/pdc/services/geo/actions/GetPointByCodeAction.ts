import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { GeoProviderInterfaceResolver } from "@/pdc/providers/geo/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/pdc/services/geo/contracts/getPointByCode.contract.ts";
import { alias } from "@/pdc/services/geo/contracts/getPointByCode.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("common.geo.find"), [
    "validate",
    alias,
  ]],
  apiRoute: {
    path: "/geo/point/by_insee",
    action: "geo:getPointByCode",
    method: "GET",
    rateLimiter: {
      key: "rl-acquisition-check",
      limit: 2_000,
      windowMinute: 1,
    },
    rpcAnswerOnFailure: true,
  },
})
export class GetPointByCodeAction extends AbstractAction {
  constructor(private provider: GeoProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.provider.literalToPosition(params.code);
  }
}
