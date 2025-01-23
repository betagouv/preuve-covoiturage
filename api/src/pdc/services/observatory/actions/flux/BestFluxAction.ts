import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";
import { BestFlux } from "@/pdc/services/observatory/dto/flux/BestFlux.ts";
import { FluxRepositoryInterfaceResolver } from "@/pdc/services/observatory/interfaces/FluxRepositoryProviderInterface.ts";
export type ResultInterface = {
  territory_1: BestFlux["code"];
  l_territory_1: string;
  territory_2: BestFlux["code"];
  l_territory_2: string;
  journeys: number;
}[];

@handler({
  service: "observatory",
  method: "getBestFlux",
  middlewares: [hasPermissionMiddleware("common.observatory.stats"), [
    "validate",
    BestFlux,
  ]],
})
export class BestFluxAction extends AbstractAction {
  constructor(private repository: FluxRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: BestFlux): Promise<ResultInterface> {
    return this.repository.getBestFlux(params);
  }
}
