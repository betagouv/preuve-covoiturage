import type {
  ParamsInterface as OperatorsParamsInterface,
  ResultInterface as OperatorsResultInterface,
} from "../contracts/operators/operators.contract.ts";

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
  OperatorsParamsInterface,
  OperatorsResultInterface,
};

export interface OperatorsRepositoryInterface {
  getOperators(
    params: OperatorsParamsInterface,
  ): Promise<OperatorsResultInterface>;
  getOperatorsByMonth(
    params: OperatorsByMonthParamsInterface,
  ): Promise<OperatorsByMonthResultInterface>;
  getOperatorsByDay(
    params: OperatorsByDayParamsInterface,
  ): Promise<OperatorsByDayResultInterface>;
}

export abstract class OperatorsRepositoryInterfaceResolver implements OperatorsRepositoryInterface {
  async getOperators(
    params: OperatorsParamsInterface,
  ): Promise<OperatorsResultInterface> {
    throw new Error();
  }
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
