import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/observatory/flux/getFlux.contract.ts";
import { alias } from "@/shared/observatory/flux/getFlux.schema.ts";
import { limitNumberParamWithinRange } from "../../helpers/checkParams.ts";
import { FluxRepositoryInterfaceResolver } from "../../interfaces/FluxRepositoryProviderInterface.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("common.observatory.stats"), [
    "validate",
    alias,
  ]],
})
export class FluxAction extends AbstractAction {
  constructor(private repository: FluxRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    params.year = limitNumberParamWithinRange(
      params.year,
      2020,
      new Date().getFullYear(),
    );
    return this.repository.getFlux(params);
  }
}
