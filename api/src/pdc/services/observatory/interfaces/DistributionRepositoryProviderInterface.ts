import type {
  ResultInterface as JourneysByDistancesResultInterface,
} from "@/pdc/services/observatory/actions/distribution/JourneysByDistancesAction.ts";
import type {
  ResultInterface as JourneysByHoursResultInterface,
} from "@/pdc/services/observatory/actions/distribution/JourneysByHoursAction.ts";
import type {
  JourneysByDistances as JourneysByDistancesParamsInterface,
} from "@/pdc/services/observatory/dto/distribution/JourneysByDistances.ts";
import type {
  JourneysByHours as JourneysByHoursParamsInterface,
} from "@/pdc/services/observatory/dto/distribution/JourneysByHours.ts";

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

export abstract class DistributionRepositoryInterfaceResolver implements DistributionRepositoryInterface {
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
