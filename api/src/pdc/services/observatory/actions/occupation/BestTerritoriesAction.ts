import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import { limitNumberParamWithinRange } from "@/pdc/services/observatory/helpers/checkParams.ts";
import { OccupationRepositoryInterfaceResolver } from "@/pdc/services/observatory/interfaces/OccupationRepositoryProviderInterface.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "../../contracts/occupation/getBestTerritories.contract.ts";
import { alias } from "../../contracts/occupation/getBestTerritories.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("common.observatory.stats"), [
    "validate",
    alias,
  ]],
})
export class BestTerritoriesAction extends AbstractAction {
  constructor(private repository: OccupationRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    params.year = limitNumberParamWithinRange(
      params.year,
      2020,
      new Date().getFullYear(),
    );
    return this.repository.getBestTerritories(params);
  }
}
