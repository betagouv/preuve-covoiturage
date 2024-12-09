import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { CampaignsRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/CampaignsRepositoryProviderInterface.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/campaigns/campaigns.contract.ts";
import { alias } from "../contracts/campaigns/campaigns.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
  ],
})
export class CampaignsAction extends AbstractAction {
  constructor(private repository: CampaignsRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.repository.getCampaigns(params);
  }
}
