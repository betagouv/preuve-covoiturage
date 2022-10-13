import { PolicyInterface } from './common/interfaces/PolicyInterface';

export interface ParamsInterface {
  territory_id?: number | null;
  operator_id?: number | null;
  status?: string;
}

export type SingleResultInterface = Omit<PolicyInterface, 'description' | 'handler'>;

export type ResultInterface = Array<SingleResultInterface>;

export const handlerConfig = {
  service: 'campaign',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
