import { CampaignInterface } from './common/interfaces/CampaignInterface';
export interface ParamsInterface {
  _id: string;
  patch: CampaignInterface;
}
export type ResultInterface = CampaignInterface;

export const handlerConfig = {
  service: 'campaign',
  method: 'patch',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
