import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { CampaignApdf } from "@/pdc/services/dashboard/dto/CampaignApdf.ts";
import { CampaignsRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/CampaignsRepositoryProviderInterface.ts";

export type ResultInterface = {
  signed_url: string;
  key: string;
  size: number;
  operator_id: number;
  campaign_id: number;
  datetime: Date;
  name: string;
}[];

@handler({
  service: "dashboard",
  method: "campaignApdf",
  middlewares: [
    ["validate", CampaignApdf],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: "territory.apdf.list",
      operator: "operator.apdf.list",
      registry: "registry.apdf.list",
    }),
  ],
})
export class CampaignApdfAction extends AbstractAction {
  constructor(private repository: CampaignsRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: CampaignApdf): Promise<ResultInterface> {
    return this.repository.getCampaignApdf(params);
  }
}
