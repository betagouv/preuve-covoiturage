import { CampaignInterface } from './common/interfaces/CampaignInterface';

export interface ParamsInterface {
  campaign: CampaignInterface;
}
export type ResultInterface = string;

export const handlerConfig = {
  service: 'campaign',
  method: 'simulateOnFake',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
