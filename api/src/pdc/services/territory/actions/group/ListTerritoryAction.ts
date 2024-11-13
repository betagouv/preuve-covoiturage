import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import { handlerConfig, ParamsInterface, ResultInterface } from "@/pdc/services/territory/contracts/list.contract.ts";
import { TerritoryRepositoryProviderInterfaceResolver } from "../../interfaces/TerritoryRepositoryProviderInterface.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    // ['validate', 'territory.list'],
    hasPermissionMiddleware("common.territory.list"),
  ],
})
export class ListTerritoryAction extends AbstractAction {
  constructor(
    private territoryRepository: TerritoryRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.list(params);
  }
}
