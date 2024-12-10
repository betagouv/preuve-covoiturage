import { ContextType, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";

import { DeleteApplication } from "@/pdc/services/cee/dto/DeleteApplication.ts";
import { getOperatorIdOrFail } from "../helpers/getOperatorIdOrFail.ts";
import { CeeRepositoryProviderInterfaceResolver } from "../interfaces/index.ts";

@handler({
  service: "cee",
  method: "deleteCeeApplication",
  middlewares: [["validate", DeleteApplication]],
})
export class DeleteCeeAction extends AbstractAction {
  constructor(
    protected ceeRepository: CeeRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(
    params: DeleteApplication,
    context: ContextType,
  ): Promise<void> {
    const operator_id = getOperatorIdOrFail(context);
    await this.ceeRepository.deleteCeeByUuid(operator_id, params.uuid);
  }
}
