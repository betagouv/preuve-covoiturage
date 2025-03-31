import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import { object, optional } from "@/lib/superstruct/index.ts";
import { Id } from "@/pdc/providers/superstruct/shared/index.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "@/pdc/services/territory/contracts/list.contract.ts";
import { TerritoryRepositoryProviderInterfaceResolver } from "../../interfaces/TerritoryRepositoryProviderInterface.ts";

export const Territories = object({
  id: optional(Id),
  page: optional(Id),
  limit: optional(Id),
});

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', Territories],
    hasPermissionMiddleware("common.territory.list"),
  ],
  apiRoute: {
    path: "/dashboard/territories",
    action: "dashboard:territories",
    method: "GET",
  },
})
export class ListTerritoryActionV2 extends AbstractAction {
  constructor(
    private territoryRepository: TerritoryRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public override async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.list(params);
  }
}
