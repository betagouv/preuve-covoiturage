import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { Campaigns } from "@/pdc/services/dashboard/dto/Campaigns.ts";
import { CampaignsRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/CampaignsRepositoryInterface.ts";

export type ResultInterface = {
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
};

@handler({
  service: "dashboard",
  method: "campaigns",
  middlewares: [
    ["validate", Campaigns],
    hasPermissionMiddleware("common.policy.list"),
  ],
  apiRoute: {
    path: "/dashboard/campaigns",
    action: "dashboard:campaigns",
    method: "GET",
  },
})
export class CampaignsAction extends AbstractAction {
  constructor(private repository: CampaignsRepositoryInterfaceResolver) {
    super();
  }

  public override async handle(params: Campaigns): Promise<ResultInterface[]> {
    return this.repository.getCampaigns(params);
  }
}
