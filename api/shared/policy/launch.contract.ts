import { CampaignInterface } from './common/interfaces/CampaignInterface';
export interface ParamsInterface {
  _id: number;
}
export interface ResultInterface extends CampaignInterface {}

export const handlerConfig = {
  service: 'campaign',
  method: 'launch',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
