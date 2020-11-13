import { CampaignInterface } from './common/interfaces/CampaignInterface';

export interface ParamsInterface {
  campaign: CampaignInterface;
}
export interface ResultInterface {}

export const handlerConfig = {
  service: 'campaign',
  method: 'simulateOnFake',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
