import type {
  ParamsInterface as JourneysByHoursParamsInterface,
  ResultInterface as JourneysByHoursResultInterface,
} from "@/shared/observatory/distribution/journeysByHours.contract.ts";
import type {
  ParamsInterface as JourneysByDistancesParamsInterface,
  ResultInterface as JourneysByDistancesResultInterface,
} from "@/shared/observatory/distribution/journeysByDistances.contract.ts";
import type {
  ParamsInterface as DeleteMonthlyDistributionParamsInterface,
  ParamsInterface as InsertMonthlyDistributionParamsInterface,
} from "@/shared/observatory/distribution/insertMonthlyDistribution.contract.ts";

export type {
  DeleteMonthlyDistributionParamsInterface,
  InsertMonthlyDistributionParamsInterface,
  JourneysByDistancesParamsInterface,
  JourneysByDistancesResultInterface,
  JourneysByHoursParamsInterface,
  JourneysByHoursResultInterface,
};

export interface DistributionRepositoryInterface {
  insertOneMonthDistribution(
    params: InsertMonthlyDistributionParamsInterface,
  ): Promise<void>;
  deleteOneMonthDistribution(
    params: DeleteMonthlyDistributionParamsInterface,
  ): Promise<void>;
  getJourneysByHours(
    params: JourneysByHoursParamsInterface,
  ): Promise<JourneysByHoursResultInterface>;
  getJourneysByDistances(
    params: JourneysByDistancesParamsInterface,
  ): Promise<JourneysByDistancesResultInterface>;
}

export abstract class DistributionRepositoryInterfaceResolver
  implements DistributionRepositoryInterface {
  async insertOneMonthDistribution(
    params: InsertMonthlyDistributionParamsInterface,
  ): Promise<void> {
    throw new Error();
  }

  async deleteOneMonthDistribution(
    params: DeleteMonthlyDistributionParamsInterface,
  ): Promise<void> {
    throw new Error();
  }

  async refreshAllDistribution(): Promise<void> {
    throw new Error();
  }

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
