import { CampaignInterface } from './common/interfaces/CampaignInterface';

// We wanna be able to declare ParamsInterface even if empty
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ParamsInterface {}

export type ResultInterface = CampaignInterface[];

export const handlerConfig = {
  service: 'campaign',
  method: 'templates',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
