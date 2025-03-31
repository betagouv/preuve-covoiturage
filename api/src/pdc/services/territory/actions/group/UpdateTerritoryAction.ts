import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionByScopeMiddleware } from "@/pdc/providers/middleware/index.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "@/pdc/services/territory/contracts/update.contract.ts";
import { alias } from "@/pdc/services/territory/contracts/update.schema.ts";
import { TerritoryRepositoryProviderInterfaceResolver } from "../../interfaces/TerritoryRepositoryProviderInterface.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionByScopeMiddleware("registry.territory.update", [
      "territory.territory.update",
      "call.user.territory_id",
      "territory_id",
    ]),
    ["validate", alias],
  ],
})
export class UpdateTerritoryAction extends AbstractAction {
  constructor(
    private territoryRepository: TerritoryRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public override async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.update(params);
  }
}
