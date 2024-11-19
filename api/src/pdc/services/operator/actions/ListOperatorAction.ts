import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { contentBlacklistMiddleware, hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/list.contract.ts";
import { OperatorRepositoryProviderInterfaceResolver } from "../interfaces/OperatorRepositoryProviderInterface.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware("common.operator.list"),
    contentBlacklistMiddleware("data.*.contacts", "data.*.bank"),
  ],
})
export class ListOperatorAction extends AbstractAction {
  constructor(
    private operatorRepository: OperatorRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(_params: ParamsInterface): Promise<ResultInterface> {
    return this.operatorRepository.all();
  }
}
