import type {
  ParamsInterface as CampaignsParamsInterface,
  ResultInterface as CampaignsResultInterface,
} from "@/shared/observatory/incentiveCampaigns/campaigns.contract.ts";

export type { CampaignsParamsInterface, CampaignsResultInterface };

export interface IncentiveCampaignsRepositoryInterface {
  getCampaigns(
    params: CampaignsParamsInterface,
  ): Promise<CampaignsResultInterface>;
}

export abstract class IncentiveCampaignsRepositoryInterfaceResolver
  implements IncentiveCampaignsRepositoryInterface {
  async getCampaigns(
    params: CampaignsParamsInterface,
  ): Promise<CampaignsResultInterface> {
    throw new Error();
  }
}
