import type {
  ParamsInterface as CampaignsParamsInterface,
  ResultInterface as CampaignsResultInterface,
} from "../contracts/campaigns/campaigns.contract.ts";

export type { CampaignsParamsInterface, CampaignsResultInterface };

export interface CampaignsRepositoryInterface {
  getCampaigns(
    params: CampaignsParamsInterface,
  ): Promise<CampaignsResultInterface>;
}

export abstract class CampaignsRepositoryInterfaceResolver implements CampaignsRepositoryInterface {
  async getCampaigns(
    params: CampaignsParamsInterface,
  ): Promise<CampaignsResultInterface> {
    throw new Error();
  }
}
