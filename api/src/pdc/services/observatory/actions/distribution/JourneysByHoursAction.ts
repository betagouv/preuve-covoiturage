import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "../../contracts/distribution/journeysByHours.contract.ts";
import { alias } from "../../contracts/distribution/journeysByHours.schema.ts";
import { limitNumberParamWithinRange } from "../../helpers/checkParams.ts";
import { DistributionRepositoryInterfaceResolver } from "../../interfaces/DistributionRepositoryProviderInterface.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("common.observatory.stats"), [
    "validate",
    alias,
  ]],
})
export class JourneysByHoursAction extends AbstractAction {
  constructor(private repository: DistributionRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    params.year = limitNumberParamWithinRange(
      params.year,
      2020,
      new Date().getFullYear(),
    );
    return this.repository.getJourneysByHours(params);
  }
}
