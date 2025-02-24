import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/helpers.ts";
import { DeleteTerritory } from "@/pdc/services/dashboard/dto/Territories.ts";
import { TerritoriesRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/TerritoriesRepositoryInterface.ts";
export type ResultInterface = {
  success: boolean;
  message: string;
};

@handler({
  service: "dashboard",
  method: "deleteTerritory",
  middlewares: [
    ["validate", DeleteTerritory],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: "registry.territory.delete",
      territory: "territory.territory.delete",
      operator: "operator.territory.delete",
    }),
  ],
  apiRoute: {
    path: "/dashboard/territory/:id",
    action: "dashboard:deleteTerritory",
    method: "DELETE",
  },
})
export class DeleteTerritoryAction extends AbstractAction {
  constructor(private repository: TerritoriesRepositoryInterfaceResolver) {
    super();
  }

  public override async handle(params: DeleteTerritory): Promise<ResultInterface> {
    return this.repository.deleteTerritory(params);
  }
}
