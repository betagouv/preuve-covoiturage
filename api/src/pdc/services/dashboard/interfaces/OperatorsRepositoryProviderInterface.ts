import type {
  ParamsInterface as OperatorsByMonthParamsInterface,
  ResultInterface as OperatorsByMonthResultInterface,
} from "../contracts/operators/operatorsByMonth.contract.ts";

import type {
  ParamsInterface as OperatorsByDayParamsInterface,
  ResultInterface as OperatorsByDayResultInterface,
} from "../contracts/operators/operatorsByDay.contract.ts";

export type {
  OperatorsByDayParamsInterface,
  OperatorsByDayResultInterface,
  OperatorsByMonthParamsInterface,
  OperatorsByMonthResultInterface,
};

export interface OperatorsRepositoryInterface {
  getOperatorsByMonth(
    params: OperatorsByMonthParamsInterface,
  ): Promise<OperatorsByMonthResultInterface>;
  getOperatorsByDay(
    params: OperatorsByDayParamsInterface,
  ): Promise<OperatorsByDayResultInterface>;
}

export abstract class OperatorsRepositoryInterfaceResolver implements OperatorsRepositoryInterface {
  async getOperatorsByMonth(
    params: OperatorsByMonthParamsInterface,
  ): Promise<OperatorsByMonthResultInterface> {
    throw new Error();
  }
  async getOperatorsByDay(
    params: OperatorsByDayParamsInterface,
  ): Promise<OperatorsByDayResultInterface> {
    throw new Error();
  }
}
