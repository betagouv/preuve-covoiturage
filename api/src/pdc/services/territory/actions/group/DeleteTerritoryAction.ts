import { handler, KernelInterfaceResolver } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";

import { hasPermissionMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "@/pdc/services/territory/contracts/delete.contract.ts";
import { alias } from "@/pdc/services/territory/contracts/delete.schema.ts";
import { TerritoryRepositoryProviderInterfaceResolver } from "../../interfaces/TerritoryRepositoryProviderInterface.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("registry.territory.delete"), [
    "validate",
    alias,
  ]],
})
export class DeleteTerritoryAction extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private territoryRepository: TerritoryRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public override async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.territoryRepository.delete(params._id);
    await this.kernel.call(
      "user:deleteAssociated",
      {
        territory_id: params._id,
      },
      {
        channel: { service: "territory" },
      },
    );
  }
}
