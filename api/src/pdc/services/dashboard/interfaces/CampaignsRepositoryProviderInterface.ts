import type {
  ParamsInterface as CampaignsParamsInterface,
  ResultInterface as CampaignsResultInterface,
} from "../contracts/campaigns/campaigns.contract.ts";

import type {
  ParamsInterface as CampaignApdfParamsInterface,
  ResultInterface as CampaignApdfResultInterface,
} from "../contracts/campaigns/campaignApdf.contract.ts";

export type {
  CampaignApdfParamsInterface,
  CampaignApdfResultInterface,
  CampaignsParamsInterface,
  CampaignsResultInterface,
};

export interface CampaignsRepositoryInterface {
  getCampaigns(
    params: CampaignsParamsInterface,
  ): Promise<CampaignsResultInterface>;

  getCampaignApdf(
    params: CampaignApdfParamsInterface,
  ): Promise<CampaignApdfResultInterface>;
}

export abstract class CampaignsRepositoryInterfaceResolver implements CampaignsRepositoryInterface {
  async getCampaigns(
    params: CampaignsParamsInterface,
  ): Promise<CampaignsResultInterface> {
    throw new Error();
  }
  async getCampaignApdf(
    params: CampaignApdfParamsInterface,
  ): Promise<CampaignApdfResultInterface> {
    throw new Error();
  }
}
