import { CampaignInterface } from './common/interfaces/CampaignInterface';
export interface ParamsInterface {
  _id: number;
  territory_id: number;
}
export interface ResultInterface extends CampaignInterface {
  state: {
    amount: number;
    trip_subsidized: number;
    trip_excluded: number;
  };
}

export const handlerConfig = {
  service: 'campaign',
  method: 'find',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
