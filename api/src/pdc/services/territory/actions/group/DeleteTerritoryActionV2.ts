import { handler, KernelInterfaceResolver } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { object } from "@/lib/superstruct/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/helpers.ts";
import { Id } from "@/pdc/providers/superstruct/shared/index.ts";
import { TerritoryRepositoryProviderInterfaceResolver } from "@/pdc/services/territory/interfaces/TerritoryRepositoryProviderInterface.ts";

import { ResultInterface } from "@/pdc/services/territory/contracts/delete.contract.ts";


export interface ParamsInterface {
  id: number;
}

export const DeleteTerritory = object({
  id: Id,
});

@handler({
  service: "dashboard",
  method: "deleteTerritory",
  middlewares: [
    ["validate-superstruct", DeleteTerritory],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: "registry.territory.delete",
      territory: "territory.territory.delete", // TODO: FIXME: remove this and copyGroupIdAndApplyGroupPermissionMiddlewares will throw 'no permissions defined'
    }),
  ],
  apiRoute: {
    path: "/dashboard/territory/:id",
    action: "dashboard:deleteTerritory",
    method: "DELETE",
  },
})
export class DeleteTerritoryActionV2 extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private territoryRepository: TerritoryRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public override async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.territoryRepository.delete(params.id);
    await this.kernel.call(
      "user:deleteAssociated",
      {
        territory_id: params.id,
      },
      {
        channel: { service: "territory" },
      },
    );
  }
}