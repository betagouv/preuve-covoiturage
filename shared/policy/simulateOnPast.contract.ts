import { PolicyInterface } from './common/interfaces/PolicyInterface';

export interface ParamsInterface {
  policy: Partial<PolicyInterface>;
}

export interface ResultInterface {
  amount: number;
  trip_subsidized: number;
  trip_excluded: number;
}

export const handlerConfig = {
  service: 'campaign',
  method: 'simulateOnPast',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
