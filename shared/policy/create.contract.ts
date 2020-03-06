import { CampaignInterface } from './common/interfaces/CampaignInterface';

export interface ParamsInterface extends CampaignInterface {}
export interface ResultInterface extends CampaignInterface {}

export const handlerConfig = {
  service: 'campaign',
  method: 'create',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
