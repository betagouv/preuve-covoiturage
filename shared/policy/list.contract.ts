import { PolicyInterface } from './common/interfaces/PolicyInterface';

export interface ParamsInterface {
  territory_id?: number | null;
  operator_id?: number | null;
  status?: string;
}

export type ResultInterface = Array<Omit<PolicyInterface, 'description' | 'handler'>>;

export const handlerConfig = {
  service: 'campaign',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
