import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import { OperatorRepositoryProviderInterfaceResolver } from "../interfaces/OperatorRepositoryProviderInterface.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/operator/findbyuuid.contract.ts";
import { alias } from "@/shared/operator/findbyuuid.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("common.operator.find"), [
    "validate",
    alias,
  ]],
})
export class FindByUuidOperatorAction extends AbstractAction {
  constructor(
    private operatorRepository: OperatorRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.operatorRepository.findByUuid(params.uuid);
  }
}
