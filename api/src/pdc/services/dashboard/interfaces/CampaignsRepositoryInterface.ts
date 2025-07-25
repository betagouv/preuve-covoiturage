import type {
  ResultInterface as CampaignApdfResultInterface,
} from "@/pdc/services/dashboard/actions/CampaignApdfAction.ts";
import type { ResultInterface as CampaignsResultInterface } from "@/pdc/services/dashboard/actions/CampaignsAction.ts";
import { CampaignApdf as CampaignApdfParamsInterface } from "@/pdc/services/dashboard/dto/CampaignApdf.ts";
import { Campaigns as CampaignsParamsInterface } from "@/pdc/services/dashboard/dto/Campaigns.ts";
import { TerritoriesWithCampaign as TerritoriesWithCampaignParamsInterface } from "@/pdc/services/dashboard/dto/TerritoriesWithCampaign.ts";

export type {
  CampaignApdfParamsInterface,
  CampaignApdfResultInterface,
  CampaignsParamsInterface,
  CampaignsResultInterface,
  TerritoriesWithCampaignParamsInterface
};

export interface CampaignsRepositoryInterface {
  getCampaigns(
    params: CampaignsParamsInterface,
  ): Promise<CampaignsResultInterface[]>;
  getCampaignApdf(
    params: CampaignApdfParamsInterface,
  ): Promise<CampaignApdfResultInterface>;
}

export abstract class CampaignsRepositoryInterfaceResolver implements CampaignsRepositoryInterface {
  async getCampaigns(
    params: CampaignsParamsInterface,
  ): Promise<CampaignsResultInterface[]> {
    throw new Error();
  }

  async getCampaignApdf(
    params: CampaignApdfParamsInterface,
  ): Promise<CampaignApdfResultInterface> {
    throw new Error();
  }
}
