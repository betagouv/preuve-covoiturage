import { CampaignInterface } from './common/interfaces/CampaignInterface';
export interface ParamsInterface {
  territory_id: string | null;
}
export type ResultInterface = CampaignInterface[];

export const handlerConfig = {
  service: 'campaign',
  method: 'listTemplate',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
