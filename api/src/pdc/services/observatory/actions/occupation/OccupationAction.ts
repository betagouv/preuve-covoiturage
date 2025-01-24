import { Feature } from "@/deps.ts";
import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";
import { Occupation } from "@/pdc/services/observatory/dto/occupation/Occupation.ts";
import { OccupationRepositoryInterfaceResolver } from "@/pdc/services/observatory/interfaces/OccupationRepositoryProviderInterface.ts";
export type ResultInterface = {
  territory: Occupation["code"];
  libelle: string;
  journeys: number;
  has_incentive?: number;
  occupation_rate: number;
  geom: Feature;
}[];

@handler({
  service: "observatory",
  method: "getOccupation",
  middlewares: [hasPermissionMiddleware("common.observatory.stats"), [
    "validate",
    Occupation,
  ]],
})
export class OccupationAction extends AbstractAction {
  constructor(private repository: OccupationRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: Occupation): Promise<ResultInterface> {
    return this.repository.getOccupation(params);
  }
}
