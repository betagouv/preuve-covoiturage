import { CampaignInterface } from './common/interfaces/CampaignInterface';
import { IncentiveInterface } from './common/interfaces/IncentiveInterface';

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
  method: 'simulate',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
