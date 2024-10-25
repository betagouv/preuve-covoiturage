import type {
  ParamsInterface as JourneysByDistancesParamsInterface,
  ResultInterface as JourneysByDistancesResultInterface,
} from "@/shared/observatory/distribution/journeysByDistances.contract.ts";
import type {
  ParamsInterface as JourneysByHoursParamsInterface,
  ResultInterface as JourneysByHoursResultInterface,
} from "@/shared/observatory/distribution/journeysByHours.contract.ts";

export type {
  JourneysByDistancesParamsInterface,
  JourneysByDistancesResultInterface,
  JourneysByHoursParamsInterface,
  JourneysByHoursResultInterface,
};

export interface DistributionRepositoryInterface {
  getJourneysByHours(
    params: JourneysByHoursParamsInterface,
  ): Promise<JourneysByHoursResultInterface>;
  getJourneysByDistances(
    params: JourneysByDistancesParamsInterface,
  ): Promise<JourneysByDistancesResultInterface>;
}

export abstract class DistributionRepositoryInterfaceResolver
  implements DistributionRepositoryInterface {
  async getJourneysByHours(
    params: JourneysByHoursParamsInterface,
  ): Promise<JourneysByHoursResultInterface> {
    throw new Error();
  }

  async getJourneysByDistances(
    params: JourneysByDistancesParamsInterface,
  ): Promise<JourneysByDistancesResultInterface> {
    throw new Error();
  }
}
