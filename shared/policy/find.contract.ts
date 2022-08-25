import { PolicyInterface } from './common/interfaces/PolicyInterface';
export interface ParamsInterface {
  _id: number;
  territory_id?: number;
}

export interface ResultInterface extends PolicyInterface {}

export const handlerConfig = {
  service: 'campaign',
  method: 'find',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
