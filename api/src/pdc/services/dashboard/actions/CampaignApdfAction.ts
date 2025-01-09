import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { CampaignApdf } from "@/pdc/services/dashboard/dto/CampaignApdf.ts";
import { CampaignsRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/CampaignsRepositoryProviderInterface.ts";

export type ResultInterface = Array<{
  signed_url: string;
  key: string;
  size: number;
  operator_id: number;
  campaign_id: number;
  datetime: Date;
  name: string;
}>;

@handler({
  service: "dashboard",
  method: "campaignApdf",
  middlewares: [
    ["validate", CampaignApdf],
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
