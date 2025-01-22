import type { ResultInterface as OperatorsResultInterface } from "@/pdc/services/dashboard/actions/OperatorsAction.ts";
import type { ResultInterface as OperatorsByDayResultInterface } from "@/pdc/services/dashboard/actions/OperatorsByDayAction.ts";
import type { ResultInterface as OperatorsByMonthResultInterface } from "@/pdc/services/dashboard/actions/OperatorsByMonthAction.ts";
import { Operators as OperatorsParamsInterface } from "@/pdc/services/dashboard/dto/Operators.ts";
import { OperatorsByDay as OperatorsByDayParamsInterface } from "@/pdc/services/dashboard/dto/OperatorsByDay.ts";
import { OperatorsByMonth as OperatorsByMonthParamsInterface } from "@/pdc/services/dashboard/dto/OperatorsByMonth.ts";

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
