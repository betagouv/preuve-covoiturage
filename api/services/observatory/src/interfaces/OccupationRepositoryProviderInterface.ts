import {
  ParamsInterface as MonthlyOccupationParamsInterface,
  ResultInterface as MonthlyOccupationResultInterface,
} from '../shared/observatory/occupation/monthlyOccupation.contract';
import {
  ParamsInterface as EvolMonthlyOccupationParamsInterface,
  ResultInterface as EvolMonthlyOccupationResultInterface,
} from '../shared/observatory/occupation/evolMonthlyOccupation.contract';

import {
  ParamsInterface as BestMonthlyTerritoriesParamsInterface,
  ResultInterface as BestMonthlyTerritoriesResultInterface,
} from '../shared/observatory/occupation/bestMonthlyTerritories.contract';

export {
  MonthlyOccupationParamsInterface,
  MonthlyOccupationResultInterface,
  EvolMonthlyOccupationParamsInterface,
  EvolMonthlyOccupationResultInterface,
  BestMonthlyTerritoriesParamsInterface,
  BestMonthlyTerritoriesResultInterface,
};

export interface OccupationRepositoryInterface {
  insertLastMonthOccupation(): Promise<void>;
  refreshAllOccupation(): Promise<void>;
  getMonthlyOccupation(params: MonthlyOccupationParamsInterface): Promise<MonthlyOccupationResultInterface>;
  getEvolMonthlyOccupation(params: EvolMonthlyOccupationParamsInterface): Promise<EvolMonthlyOccupationResultInterface>;
  getBestMonthlyTerritories(
    params: BestMonthlyTerritoriesParamsInterface,
  ): Promise<BestMonthlyTerritoriesResultInterface>;
}

export abstract class OccupationRepositoryInterfaceResolver implements OccupationRepositoryInterface {
  async insertLastMonthOccupation(): Promise<void> {
    throw new Error();
  }

  async refreshAllOccupation(): Promise<void> {
    throw new Error();
  }

  async getMonthlyOccupation(params: MonthlyOccupationParamsInterface): Promise<MonthlyOccupationResultInterface> {
    throw new Error();
  }

  async getEvolMonthlyOccupation(
    params: EvolMonthlyOccupationParamsInterface,
  ): Promise<EvolMonthlyOccupationResultInterface> {
    throw new Error();
  }

  async getBestMonthlyTerritories(
    params: BestMonthlyTerritoriesParamsInterface,
  ): Promise<BestMonthlyTerritoriesResultInterface> {
    throw new Error();
  }
}
