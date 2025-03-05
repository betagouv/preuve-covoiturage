import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { Infer } from "@/lib/superstruct/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";
import { Direction } from "@/pdc/providers/superstruct/shared/index.ts";
import { Incentive } from "@/pdc/services/observatory/dto/Incentive.ts";
import { IncentiveRepositoryInterfaceResolver } from "../../interfaces/IncentiveRepositoryProviderInterface.ts";

export type ResultInterface = {
  code: Incentive["code"];
  libelle: string;
  direction: Infer<typeof Direction>;
  collectivite: number;
  operateur: number;
  autres: number;
}[];

@handler({
  service: "observatory",
  method: "getIncentive",
  middlewares: [hasPermissionMiddleware("common.observatory.stats"), [
    "validate",
    Incentive,
  ]],
  apiRoute: {
    path: "/observatory/incentive",
    action: "observatory:getIncentive",
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
export class IncentiveAction extends AbstractAction {
  constructor(private repository: IncentiveRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: Incentive): Promise<ResultInterface> {
    return this.repository.getIncentive(params);
  }
}
