import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { IncentiveRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/IncentiveRepositoryProviderInterface.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/incentive/incentiveByDay.contract.ts";
import { alias } from "../contracts/incentive/incentiveByDay.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
  ],
})
export class IncentiveByDayAction extends AbstractAction {
  constructor(private repository: IncentiveRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.repository.getIncentiveByDay(params);
  }
}
