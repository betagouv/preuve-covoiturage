import type {
  ParamsInterface as OperatorsByMonthParamsInterface,
  ResultInterface as OperatorsByMonthResultInterface,
} from "../contracts/operators/operatorsByMonth.contract.ts";

export type { OperatorsByMonthParamsInterface, OperatorsByMonthResultInterface };

export interface OperatorsRepositoryInterface {
  getOperatorsByMonth(
    params: OperatorsByMonthParamsInterface,
  ): Promise<OperatorsByMonthResultInterface>;
}

export abstract class OperatorsRepositoryInterfaceResolver implements OperatorsRepositoryInterface {
  async getOperatorsByMonth(
    params: OperatorsByMonthParamsInterface,
  ): Promise<OperatorsByMonthResultInterface> {
    throw new Error();
  }
}
