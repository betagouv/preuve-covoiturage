import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { OperatorsRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/OperatorsRepositoryProviderInterface.ts";
import { limitNumberParamWithinRange } from "@/pdc/services/observatory/helpers/checkParams.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/operators/operatorsByMonth.contract.ts";
import { alias } from "../contracts/operators/operatorsByMonth.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
  ],
})
export class OperatorsByMonthAction extends AbstractAction {
  constructor(private repository: OperatorsRepositoryInterfaceResolver) {
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
    return this.repository.getOperatorsByMonth(params);
  }
}
