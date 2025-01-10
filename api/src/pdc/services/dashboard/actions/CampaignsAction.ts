import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { Campaigns } from "@/pdc/services/dashboard/dto/Campaigns.ts";
import { CampaignsRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/CampaignsRepositoryProviderInterface.ts";

export type ResultInterface = Array<{
  id: string;
  start_date: Date;
  end_date: Date;
  territory_id: string;
  territory_name: string;
  name: string;
  description: string;
  unit: string;
  status: string;
  handler: string;
  incentive_sum: number;
  max_amount: number;
}>;

@handler({
  service: "dashboard",
  method: "campaigns",
  middlewares: [
    ["validate", Campaigns],
  ],
})
export class CampaignsAction extends AbstractAction {
  constructor(private repository: CampaignsRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: Campaigns): Promise<ResultInterface> {
    return this.repository.getCampaigns(params);
  }
}
