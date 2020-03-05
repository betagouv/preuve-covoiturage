import { CampaignInterface } from './common/interfaces/CampaignInterface';

export interface ParamsInterface {}

export type ResultInterface = CampaignInterface[];

export const handlerConfig = {
  service: 'campaign',
  method: 'templates',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
