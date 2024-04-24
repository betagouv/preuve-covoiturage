import {
  ParamsInterface as OneCampaignParamsInterface,
  ResultInterface as OneCampaignResultInterface,
} from '@shared/observatory/incentiveCampaigns/OneCampaign.contract';
import {
  ParamsInterface as AllCampaignsParamsInterface,
  ResultInterface as AllCampaignsResultInterface,
} from '@shared/observatory/incentiveCampaigns/AllCampaigns.contract';



export {
  OneCampaignParamsInterface,
  OneCampaignResultInterface,
  AllCampaignsParamsInterface,
  AllCampaignsResultInterface,
};

export interface IncentiveCampaignsRepositoryInterface {
  getOneCampaign(params: OneCampaignParamsInterface): Promise<OneCampaignResultInterface>;
  getAllCampaigns(params: AllCampaignsParamsInterface): Promise<AllCampaignsResultInterface>;
}

export abstract class IncentiveCampaignsRepositoryInterfaceResolver implements IncentiveCampaignsRepositoryInterface {
  async getOneCampaign(params: OneCampaignParamsInterface): Promise<OneCampaignResultInterface> {
    throw new Error();
  } 
  async getAllCampaigns(params: AllCampaignsParamsInterface): Promise<AllCampaignsResultInterface> {
    throw new Error();
  } 
}
