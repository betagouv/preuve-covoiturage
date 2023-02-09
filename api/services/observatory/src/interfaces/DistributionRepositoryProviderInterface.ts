import {
  ParamsInterface as JourneysByHoursParamsInterface,
  ResultInterface as JourneysByHoursResultInterface,
} from '../shared/observatory/distribution/journeysByHours.contract';
import {
  ParamsInterface as JourneysByDistancesParamsInterface,
  ResultInterface as JourneysByDistancesResultInterface,
} from '../shared/observatory/distribution/journeysByDistances.contract';

export {
  JourneysByHoursParamsInterface,
  JourneysByHoursResultInterface,
  JourneysByDistancesParamsInterface,
  JourneysByDistancesResultInterface,
};

export interface DistributionRepositoryInterface {
  insertLastMonthDistribution(): Promise<void>;
  refreshAllDistribution(): Promise<void>;
  getJourneysByHours(params: JourneysByHoursParamsInterface): Promise<JourneysByHoursResultInterface>;
  getJourneysByDistances(params: JourneysByDistancesParamsInterface): Promise<JourneysByDistancesResultInterface>;
}

export abstract class DistributionRepositoryInterfaceResolver implements DistributionRepositoryInterface {
  async insertLastMonthDistribution(): Promise<void> {
    throw new Error();
  }

  async refreshAllDistribution(): Promise<void> {
    throw new Error();
  }

  async getJourneysByHours(params: JourneysByHoursParamsInterface): Promise<JourneysByHoursResultInterface> {
    throw new Error();
  }

  async getJourneysByDistances(
    params: JourneysByDistancesParamsInterface,
  ): Promise<JourneysByDistancesResultInterface> {
    throw new Error();
  }
}
