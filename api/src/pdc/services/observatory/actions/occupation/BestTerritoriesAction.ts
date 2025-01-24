import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";
import { BestTerritories } from "@/pdc/services/observatory/dto/occupation/BestTerritories.ts";
import { OccupationRepositoryInterfaceResolver } from "@/pdc/services/observatory/interfaces/OccupationRepositoryProviderInterface.ts";
export type ResultInterface = {
  territory: BestTerritories["code"];
  l_territory: string;
  journeys: number;
}[];

@handler({
  service: "observatory",
  method: "getBestTerritories",
  middlewares: [hasPermissionMiddleware("common.observatory.stats"), [
    "validate",
    BestTerritories,
  ]],
})
export class BestTerritoriesAction extends AbstractAction {
  constructor(private repository: OccupationRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: BestTerritories): Promise<ResultInterface> {
    return this.repository.getBestTerritories(params);
  }
}
