import { CampaignInterface } from './common/interfaces/CampaignInterface';

export interface ParamsInterface {
  campaign: CampaignInterface;
}
export interface ResultInterface {
  amount: number;
  trip_subsidized: number;
  trip_excluded: number;
}

export const handlerConfig = {
  service: 'campaign',
  method: 'simulateOnPast',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
