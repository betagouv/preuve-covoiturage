import { PaymentInterface, IncentiveInterface } from './index.ts';

export type CostResultInterface = {
  cost: number;
  payments: PaymentInterface[];
  payment: number;
};

export interface CostParamsInterface {
  operator_id: number;
  contribution: number;
  incentives: IncentiveInterface[];
  payments: PaymentInterface[];
  payment: number;
}

export interface CostNormalizerProviderInterface {
  handle(params: CostParamsInterface): Promise<CostResultInterface>;
}
