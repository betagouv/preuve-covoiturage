import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import { limitNumberParamWithinRange } from "@/pdc/services/observatory/helpers/checkParams.ts";
import { DistributionRepositoryInterfaceResolver } from "@/pdc/services/observatory/interfaces/DistributionRepositoryProviderInterface.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "../../contracts/distribution/journeysByDistances.contract.ts";
import { alias } from "../../contracts/distribution/journeysByDistances.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("common.observatory.stats"), [
    "validate",
    alias,
  ]],
})
export class JourneysByDistancesAction extends AbstractAction {
  constructor(private repository: DistributionRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    params.year = limitNumberParamWithinRange(
      params.year,
      2020,
      new Date().getFullYear(),
    );
    return this.repository.getJourneysByDistances(params);
  }
}
