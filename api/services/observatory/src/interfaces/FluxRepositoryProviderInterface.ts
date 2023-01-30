import {
  ParamsInterface as InsertLastMonthFluxParamsInterface,
  ResultInterface as InsertLastMonthFluxResultInterface,
} from '../shared/observatory/flux/insertLastMonthFlux.contract';
import {
  ParamsInterface as refreshAllFluxParamsInterface,
  ResultInterface as refreshAllFluxResultInterface,
} from '../shared/observatory/flux/refreshAllFlux.contract';
import {
  ParamsInterface as MonthlyFluxParamsInterface,
  ResultInterface as MonthlyFluxResultInterface,
} from '../shared/observatory/flux/monthlyFlux.contract';

import {
  ParamsInterface as lastRecordMonthlyFluxParamsInterface,
  ResultInterface as lastRecordMonthlyFluxResultInterface,
} from '../shared/observatory/flux/lastRecordMonthlyFlux.contract';

import {
  ParamsInterface as EvolMonthlyFluxParamsInterface,
  ResultInterface as EvolMonthlyFluxResultInterface,
} from '../shared/observatory/flux/evolMonthlyFlux.contract';

import {
  ParamsInterface as BestMonthlyFluxParamsInterface,
  ResultInterface as BestMonthlyFluxResultInterface,
} from '../shared/observatory/flux/bestMonthlyFlux.contract';

export {
  InsertLastMonthFluxParamsInterface,
  InsertLastMonthFluxResultInterface,
  refreshAllFluxParamsInterface,
  refreshAllFluxResultInterface,
  MonthlyFluxParamsInterface,
  MonthlyFluxResultInterface,
  lastRecordMonthlyFluxParamsInterface,
  lastRecordMonthlyFluxResultInterface,
  EvolMonthlyFluxParamsInterface,
  EvolMonthlyFluxResultInterface,
  BestMonthlyFluxParamsInterface,
  BestMonthlyFluxResultInterface,
};

export interface FluxRepositoryInterface {
  insertLastMonthFlux(params: InsertLastMonthFluxParamsInterface): Promise<InsertLastMonthFluxResultInterface>;
  refreshAllFlux(params: refreshAllFluxParamsInterface): Promise<refreshAllFluxResultInterface>;
  getMonthlyFlux(params: MonthlyFluxParamsInterface): Promise<MonthlyFluxResultInterface>;
  lastRecordMonthlyFlux(params: lastRecordMonthlyFluxParamsInterface): Promise<lastRecordMonthlyFluxResultInterface>;
  getEvolMonthlyFlux(params: EvolMonthlyFluxParamsInterface): Promise<EvolMonthlyFluxResultInterface>;
  getBestMonthlyFlux(params: BestMonthlyFluxParamsInterface): Promise<BestMonthlyFluxResultInterface>;
}

export abstract class FluxRepositoryInterfaceResolver implements FluxRepositoryInterface {
  async insertLastMonthFlux(params: InsertLastMonthFluxParamsInterface): Promise<InsertLastMonthFluxResultInterface> {
    throw new Error();
  }

  async refreshAllFlux(params: refreshAllFluxParamsInterface): Promise<refreshAllFluxResultInterface> {
    throw new Error();
  }

  async getMonthlyFlux(params: MonthlyFluxParamsInterface): Promise<MonthlyFluxResultInterface> {
    throw new Error();
  }

  async lastRecordMonthlyFlux(
    params: lastRecordMonthlyFluxParamsInterface,
  ): Promise<lastRecordMonthlyFluxResultInterface> {
    throw new Error();
  }

  async getEvolMonthlyFlux(params: EvolMonthlyFluxParamsInterface): Promise<EvolMonthlyFluxResultInterface> {
    throw new Error();
  }

  async getBestMonthlyFlux(params: BestMonthlyFluxParamsInterface): Promise<BestMonthlyFluxResultInterface> {
    throw new Error();
  }
}
