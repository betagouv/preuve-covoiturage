import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { TerritoryRepositoryProviderInterfaceResolver } from "@/pdc/services/territory/interfaces/TerritoryRepositoryProviderInterface.ts";
export type ResultInterface = {
  success: boolean;
  message: string;
};

@handler({
  service: "dashboard",
  method: "createTerritory",
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: "registry.territory.create",
      territory: "territory.territory.create",
    }),
  ],
  apiRoute: {
    path: "/dashboard/territory",
    action: "dashboard:createTerritory",
    method: "POST",
  },
})
export class CreateTerritoryAction extends AbstractAction {
  constructor(private repository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public override async handle(data: CreateTerritory): Promise<ResultInterface> {
    return this.repository.create(data);
  }
}
