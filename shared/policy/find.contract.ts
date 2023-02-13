import { CompiledPolicyInterface } from './common/interfaces/PolicyInterface';
export interface ParamsInterface {
  _id: number;
  territory_id?: number;
  operator_id?: number;
}

export interface ResultInterface extends Required<CompiledPolicyInterface> {}

export const handlerConfig = {
  service: 'campaign',
  method: 'find',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
