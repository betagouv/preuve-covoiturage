import { CampaignInterface } from './common/interfaces/CampaignInterface';

export interface ParamsInterface {
  territory_id?: number | null;
  status?: string;
}

export type ResultInterface = Array<Omit<CampaignInterface, 'description'>>;

export const handlerConfig = {
  service: 'campaign',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
