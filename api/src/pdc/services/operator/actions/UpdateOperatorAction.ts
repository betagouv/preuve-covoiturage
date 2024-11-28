import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from "@/pdc/providers/middleware/index.ts";

import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/update.contract.ts";
import { alias } from "../contracts/update.schema.ts";
import { phoneComplianceHelper } from "../helpers/phoneComplianceHelper.ts";
import { OperatorRepositoryProviderInterfaceResolver } from "../interfaces/OperatorRepositoryProviderInterface.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    copyFromContextMiddleware("call.user.operator_id", "_id"),
    ["validate", alias],
    hasPermissionByScopeMiddleware("registry.operator.update", [
      "operator.operator.update",
      "call.user.operator_id",
      "_id",
    ]),
  ],
})
export class UpdateOperatorAction extends AbstractAction {
  constructor(
    private operatorRepository: OperatorRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // check phone numbers
    phoneComplianceHelper(params.contacts);

    return this.operatorRepository.update(params);
  }
}
