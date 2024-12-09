import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { IncentiveRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/IncentiveRepositoryProviderInterface.ts";
import { limitNumberParamWithinRange } from "@/pdc/services/observatory/helpers/checkParams.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/incentive/incentiveByMonth.contract.ts";
import { alias } from "../contracts/incentive/incentiveByMonth.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
  ],
})
export class IncentiveByMonthAction extends AbstractAction {
  constructor(private repository: IncentiveRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (params.year) {
      params.year = limitNumberParamWithinRange(
        params.year,
        2020,
        new Date().getFullYear(),
      );
    }
    return this.repository.getIncentiveByMonth(params);
  }
}
