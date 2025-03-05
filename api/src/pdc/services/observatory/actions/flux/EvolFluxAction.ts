import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";
import { EvolFlux } from "@/pdc/services/observatory/dto/flux/EvolFlux.ts";
import { FluxRepositoryInterfaceResolver } from "@/pdc/services/observatory/interfaces/FluxRepositoryProviderInterface.ts";
export type ResultInterface = {
  territory: EvolFlux["code"];
  l_territory: string;
  journeys?: number;
  passengers?: number;
  has_incentive?: number;
  distance?: number;
  duration?: number;
}[];

@handler({
  service: "observatory",
  method: "getEvolFlux",
  middlewares: [hasPermissionMiddleware("common.observatory.stats"), [
    "validate",
    EvolFlux,
  ]],
  apiRoute: {
    path: "/observatory/evol-flux",
    action: "observatory:getEvolFlux",
    method: "GET",
    actionContextFn: async (req) => {
      return {
        channel: {
          service: "proxy",
          transport: "http",
        },
        call: {
          user: {
            permissions: ["common.observatory.stats"],
          },
          api_version_range: "v3",
        },
      } as ContextType;
    },
  },
})
export class EvolFluxAction extends AbstractAction {
  constructor(private repository: FluxRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: EvolFlux): Promise<ResultInterface> {
    return this.repository.getEvolFlux(params);
  }
}
