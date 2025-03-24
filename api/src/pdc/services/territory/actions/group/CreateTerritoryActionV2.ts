import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { object } from "@/lib/superstruct/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { Siret, Varchar } from "@/pdc/providers/superstruct/shared/index.ts";


import { ParamsInterface, ResultInterface } from "@/pdc/services/territory/contracts/create.contract.ts";
import { TerritoryRepositoryProviderInterfaceResolver } from "../../interfaces/TerritoryRepositoryProviderInterface.ts";

const CreateTerritory = object({
  name: Varchar,
  siret: Siret,
});

@handler({
  service: "dashboard",
  method: "createTerritory",
  middlewares: [
    ["validate", CreateTerritory],
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
export class CreateTerritoryActionV2 extends AbstractAction {
  constructor(
    private territoryRepository: TerritoryRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public override async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.create(params);
  }
}
