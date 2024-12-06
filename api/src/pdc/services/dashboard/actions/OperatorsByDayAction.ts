import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { OperatorsRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/OperatorsRepositoryProviderInterface.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/operators/operatorsByDay.contract.ts";
import { alias } from "../contracts/operators/operatorsByDay.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
  ],
})
export class OperatorsByDayAction extends AbstractAction {
  constructor(private repository: OperatorsRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.repository.getOperatorsByDay(params);
  }
}
