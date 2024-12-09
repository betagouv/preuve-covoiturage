import type {
  ParamsInterface as IncentiveByMonthParamsInterface,
  ResultInterface as IncentiveByMonthResultInterface,
} from "../contracts/operators/operatorsByMonth.contract.ts";

import type {
  ParamsInterface as IncentiveByDayParamsInterface,
  ResultInterface as IncentiveByDayResultInterface,
} from "../contracts/operators/operatorsByDay.contract.ts";

export type {
  IncentiveByDayParamsInterface,
  IncentiveByDayResultInterface,
  IncentiveByMonthParamsInterface,
  IncentiveByMonthResultInterface,
};

export interface IncentiveRepositoryInterface {
  getIncentiveByMonth(
    params: IncentiveByMonthParamsInterface,
  ): Promise<IncentiveByMonthResultInterface>;
  getIncentiveByDay(
    params: IncentiveByDayParamsInterface,
  ): Promise<IncentiveByDayResultInterface>;
}

export abstract class IncentiveRepositoryInterfaceResolver implements IncentiveRepositoryInterface {
  async getIncentiveByMonth(
    params: IncentiveByMonthParamsInterface,
  ): Promise<IncentiveByMonthResultInterface> {
    throw new Error();
  }
  async getIncentiveByDay(
    params: IncentiveByDayParamsInterface,
  ): Promise<IncentiveByDayResultInterface> {
    throw new Error();
  }
}
