import { CampaignInterface } from './common/interfaces/CampaignInterface';
export type ParamsInterface = void;
export type ResultInterface = CampaignInterface[];

export const handlerConfig = {
  service: 'campaign',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
