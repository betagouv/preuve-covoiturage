import type {
  ResultInterface as IncentiveByDayResultInterface,
} from "@/pdc/services/dashboard/actions/IncentiveByDayAction.ts";
import type {
  ResultInterface as IncentiveByMonthResultInterface,
} from "@/pdc/services/dashboard/actions/IncentiveByMonthAction.ts";
import type { IncentiveByDay as IncentiveByDayParamsInterface } from "@/pdc/services/dashboard/dto/IncentiveByDay.ts";
import type { IncentiveByMonth as IncentiveByMonthParamsInterface } from "@/pdc/services/dashboard/dto/IncentiveByMonth.ts";

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
