import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from "@/pdc/providers/middleware/index.ts";

import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/find.contract.ts";
import { alias } from "../contracts/find.schema.ts";
import { OperatorRepositoryProviderInterfaceResolver } from "../interfaces/OperatorRepositoryProviderInterface.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    copyFromContextMiddleware("call.user.operator_id", "_id"),
    ["validate", alias],
    hasPermissionByScopeMiddleware("registry.operator.find", [
      "operator.operator.find",
      "call.user.operator_id",
      "_id",
    ]),
  ],
})
export class FindOperatorAction extends AbstractAction {
  constructor(
    private operatorRepository: OperatorRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.operatorRepository.find(params._id, true);
  }
}
