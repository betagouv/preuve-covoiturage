import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { Territories } from "@/pdc/services/dashboard/dto/Territories.ts";
import { TerritoriesRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/TerritoriesRepositoryProviderInterface.ts";
export type ResultInterface = {
  id: string;
  name: string;
}[];

@handler({
  service: "dashboard",
  method: "territories",
  middlewares: [
    ["validate", Territories],
    hasPermissionMiddleware("common.territory.list"),
  ],
})
export class TerritoriesAction extends AbstractAction {
  constructor(private repository: TerritoriesRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: Territories): Promise<ResultInterface> {
    return this.repository.getTerritories(params);
  }
}
