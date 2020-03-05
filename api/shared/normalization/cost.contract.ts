import { IncentiveInterface } from '../common/interfaces/IncentiveInterface';
import { PaymentInterface } from '../common/interfaces/PaymentInterface';

export type ResultInterface = {
  cost: number;
  payments: PaymentInterface[];
};

export interface ParamsInterface {
  operator_id: number | string;
  revenue?: number;
  contribution?: number;
  incentives?: IncentiveInterface[];
  payments?: PaymentInterface[];
  isDriver?: boolean;
}

export const handlerConfig = {
  service: 'normalization',
  method: 'cost',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
