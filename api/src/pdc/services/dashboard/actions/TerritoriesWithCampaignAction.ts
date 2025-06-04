import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { TerritoriesWithCampaign } from "@/pdc/services/dashboard/dto/TerritoriesWithCampaign.ts";
import { CampaignsRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/CampaignsRepositoryInterface.ts";

export type ResultInterface = {
  id: string;
  name: string;
};

@handler({
  service: "dashboard",
  method: "territoriesWithCampaign",
  middlewares: [
    ["validate", TerritoriesWithCampaign],
    hasPermissionMiddleware("common.policy.list"),
  ],
  apiRoute: {
    path: "/dashboard/territories_campaign",
    action: "dashboard:territoriesWithCampaign",
    method: "GET",
  },
})
export class TerritoriesWithCampaignAction extends AbstractAction {
  constructor(private repository: CampaignsRepositoryInterfaceResolver) {
    super();
  }

  public override async handle(params: TerritoriesWithCampaign): Promise<ResultInterface[]> {
    return this.repository.getTerritoriesWithCampaign(params);
  }
}
