import type { ResultInterface as JourneysIncentiveByDayResultInterface } from "@/pdc/services/dashboard/actions/JourneysIncentiveByDayAction.ts";
import type { ResultInterface as JourneysIncentiveByMonthResultInterface } from "@/pdc/services/dashboard/actions/JourneysIncentiveByMonthAction.ts";
import {
  JourneysByDay as JourneysIncentiveByDayParamsInterface,
  JourneysByDay as JourneysOperatorsByDayParamsInterface,
  JourneysByMonth as JourneysIncentiveByMonthParamsInterface,
  JourneysByMonth as JourneysOperatorsByMonthParamsInterface,
} from "@/pdc/services/dashboard/dto/Journeys.ts";
import type { ResultInterface as JourneysOperatorsByDayResultInterface } from "../actions/JourneysOperatorsByDayAction.ts";
import type { ResultInterface as JourneysOperatorsByMonthResultInterface } from "../actions/JourneysOperatorsByMonthAction.ts";

export type {
  JourneysIncentiveByDayParamsInterface,
  JourneysIncentiveByDayResultInterface,
  JourneysIncentiveByMonthParamsInterface,
  JourneysIncentiveByMonthResultInterface,
  JourneysOperatorsByDayParamsInterface,
  JourneysOperatorsByDayResultInterface,
  JourneysOperatorsByMonthParamsInterface,
  JourneysOperatorsByMonthResultInterface,
};

export interface JourneysRepositoryInterface {
  getOperatorsByMonth(
    params: JourneysOperatorsByMonthParamsInterface,
  ): Promise<JourneysOperatorsByMonthResultInterface[]>;
  getOperatorsByDay(
    params: JourneysOperatorsByDayParamsInterface,
  ): Promise<JourneysOperatorsByDayResultInterface[]>;
  getIncentiveByMonth(
    params: JourneysIncentiveByMonthParamsInterface,
  ): Promise<JourneysIncentiveByMonthResultInterface[]>;
  getIncentiveByDay(
    params: JourneysIncentiveByDayParamsInterface,
  ): Promise<JourneysIncentiveByDayResultInterface[]>;
}

export abstract class JourneysRepositoryInterfaceResolver implements JourneysRepositoryInterface {
  async getOperatorsByMonth(
    params: JourneysOperatorsByMonthParamsInterface,
  ): Promise<JourneysOperatorsByMonthResultInterface[]> {
    throw new Error();
  }
  async getOperatorsByDay(
    params: JourneysOperatorsByDayParamsInterface,
  ): Promise<JourneysOperatorsByDayResultInterface[]> {
    throw new Error();
  }
  async getIncentiveByMonth(
    params: JourneysIncentiveByMonthParamsInterface,
  ): Promise<JourneysIncentiveByMonthResultInterface[]> {
    throw new Error();
  }
  async getIncentiveByDay(
    params: JourneysIncentiveByDayParamsInterface,
  ): Promise<JourneysIncentiveByDayResultInterface[]> {
    throw new Error();
  }
}
