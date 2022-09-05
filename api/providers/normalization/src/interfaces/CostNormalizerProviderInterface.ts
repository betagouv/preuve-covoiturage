import { PaymentInterface, IncentiveInterface } from '.';

export type CostResultInterface = {
  cost: number;
  payments: PaymentInterface[];
};

export interface CostParamsInterface {
  operator_id: number;
  revenue?: number;
  contribution?: number;
  incentives?: IncentiveInterface[];
  payments?: PaymentInterface[];
  isDriver?: boolean;
}

export interface CostNormalizerProviderInterface {
  handle(params: CostParamsInterface): Promise<CostResultInterface>;
}