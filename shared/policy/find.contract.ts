import { PolicyInterface } from './common/interfaces/PolicyInterface';
export interface ParamsInterface {
  _id: number;
  territory_id?: number;
}

export interface ResultInterface extends Required<PolicyInterface> {}

export const handlerConfig = {
  service: 'campaign',
  method: 'find',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
