import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import { handlerConfig, ParamsInterface, ResultInterface } from "@/pdc/services/territory/contracts/find.contract.ts";
import { alias } from "@/pdc/services/territory/contracts/find.schema.ts";
import { TerritoryRepositoryProviderInterfaceResolver } from "../../interfaces/TerritoryRepositoryProviderInterface.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("common.territory.find"), [
    "validate",
    alias,
  ]],
})
export class FindTerritoryAction extends AbstractAction {
  constructor(
    private territoryRepository: TerritoryRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.find(params);
  }
}
