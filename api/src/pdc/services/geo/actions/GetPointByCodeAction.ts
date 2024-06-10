import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { handler } from "@/ilos/common/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/geo/getPointByCode.contract.ts";
import { alias } from "@/shared/geo/getPointByCode.schema.ts";
import { GeoProviderInterfaceResolver } from "@/pdc/providers/geo/index.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("common.geo.find"), [
    "validate",
    alias,
  ]],
})
export class GetPointByCodeAction extends AbstractAction {
  constructor(private provider: GeoProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.provider.literalToPosition(params.code);
  }
}
