import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { handler } from "@/ilos/common/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import { TerritoryRepositoryProviderInterfaceResolver } from "../../interfaces/TerritoryRepositoryProviderInterface.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/territory/create.contract.ts";
import { alias } from "@/shared/territory/create.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("registry.territory.create"), [
    "validate",
    alias,
  ]],
})
export class CreateTerritoryAction extends AbstractAction {
  constructor(
    private territoryRepository: TerritoryRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.create(params);
  }
}
