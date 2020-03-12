import { CampaignInterface } from './common/interfaces/CampaignInterface';

// eslint-disable-next-line
export interface ParamsInterface {}

export type ResultInterface = CampaignInterface[];

export const handlerConfig = {
  service: 'campaign',
  method: 'templates',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
