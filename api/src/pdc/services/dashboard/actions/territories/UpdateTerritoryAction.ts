import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { UpdateTerritory } from "@/pdc/services/dashboard/dto/Territories.ts";
import { TerritoriesRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/TerritoriesRepositoryInterface.ts";
export type ResultInterface = {
  success: boolean;
  message: string;
};

@handler({
  service: "dashboard",
  method: "updateTerritory",
  middlewares: [
    ["validate", UpdateTerritory],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: "registry.territory.update",
      territory: "territory.territory.update",
      operator: "operator.territory.update",
    }),
  ],
  apiRoute: {
    path: "/dashboard/territory",
    action: "dashboard:updateTerritory",
    method: "PUT",
  },
})
export class UpdateTerritoryAction extends AbstractAction {
  constructor(private repository: TerritoriesRepositoryInterfaceResolver) {
    super();
  }

  public override async handle(data: UpdateTerritory): Promise<ResultInterface> {
    return this.repository.updateTerritory(data);
  }
}
