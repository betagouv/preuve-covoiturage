import {
  ParamsInterface as InsertLastMonthDistributionParamsInterface,
  ResultInterface as InsertLastMonthDistributionResultInterface,
} from '../shared/observatory/distribution/insertLastMonthDistribution.contract';
import {
  ParamsInterface as refreshAllDistributionParamsInterface,
  ResultInterface as refreshAllDistributionResultInterface,
} from '../shared/observatory/distribution/refreshAllDistribution.contract';
import {
  ParamsInterface as JourneysByHoursParamsInterface,
  ResultInterface as JourneysByHoursResultInterface,
} from '../shared/observatory/distribution/journeysByHours.contract';
import {
  ParamsInterface as JourneysByDistancesParamsInterface,
  ResultInterface as JourneysByDistancesResultInterface,
} from '../shared/observatory/distribution/journeysByDistances.contract';

export {
  InsertLastMonthDistributionParamsInterface,
  InsertLastMonthDistributionResultInterface,
  refreshAllDistributionParamsInterface,
  refreshAllDistributionResultInterface,
  JourneysByHoursParamsInterface,
  JourneysByHoursResultInterface,
  JourneysByDistancesParamsInterface,
  JourneysByDistancesResultInterface,
};

export interface DistributionRepositoryInterface {
  insertLastMonthDistribution(params: InsertLastMonthDistributionParamsInterface): Promise<InsertLastMonthDistributionResultInterface>;
  refreshAllDistribution(params: refreshAllDistributionParamsInterface): Promise<refreshAllDistributionResultInterface>;
  getJourneysByHours(params: JourneysByHoursParamsInterface): Promise<JourneysByHoursResultInterface>;
  getJourneysByDistances(params: JourneysByDistancesParamsInterface): Promise<JourneysByDistancesResultInterface>;
};

export abstract class DistributionRepositoryInterfaceResolver implements DistributionRepositoryInterface {
  async insertLastMonthDistribution(params: InsertLastMonthDistributionParamsInterface): Promise<InsertLastMonthDistributionResultInterface> {
    throw new Error();
  };

  async refreshAllDistribution(params: refreshAllDistributionParamsInterface): Promise<refreshAllDistributionResultInterface> {
    throw new Error();
  };

  async getJourneysByHours(params: JourneysByHoursParamsInterface): Promise<JourneysByHoursResultInterface> {
    throw new Error();
  };

  async getJourneysByDistances(params: JourneysByDistancesParamsInterface): Promise<JourneysByDistancesResultInterface> {
    throw new Error();
  };
};