import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";
import { limitNumberParamWithinRange } from "@/pdc/services/observatory/helpers/checkParams.ts";
import { FluxRepositoryInterfaceResolver } from "@/pdc/services/observatory/interfaces/FluxRepositoryProviderInterface.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../../contracts/flux/getBestFlux.contract.ts";
import { alias } from "../../contracts/flux/getBestFlux.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("common.observatory.stats"), [
    "validate",
    alias,
  ]],
})
export class BestFluxAction extends AbstractAction {
  constructor(private repository: FluxRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    params.year = limitNumberParamWithinRange(
      params.year,
      2020,
      new Date().getFullYear(),
    );
    return this.repository.getBestFlux(params);
  }
}
