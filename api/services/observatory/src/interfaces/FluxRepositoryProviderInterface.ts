import {
  ParamsInterface as MonthlyFluxParamsInterface,
  ResultInterface as MonthlyFluxResultInterface,
} from '../shared/observatory/flux/monthlyFlux.contract';

// eslint-disable-next-line max-len
import { ResultInterface as lastRecordMonthlyFluxResultInterface } from '../shared/observatory/flux/lastRecordMonthlyFlux.contract';

import {
  ParamsInterface as EvolMonthlyFluxParamsInterface,
  ResultInterface as EvolMonthlyFluxResultInterface,
} from '../shared/observatory/flux/evolMonthlyFlux.contract';

import {
  ParamsInterface as BestMonthlyFluxParamsInterface,
  ResultInterface as BestMonthlyFluxResultInterface,
} from '../shared/observatory/flux/bestMonthlyFlux.contract';

export {
  MonthlyFluxParamsInterface,
  MonthlyFluxResultInterface,
  lastRecordMonthlyFluxResultInterface,
  EvolMonthlyFluxParamsInterface,
  EvolMonthlyFluxResultInterface,
  BestMonthlyFluxParamsInterface,
  BestMonthlyFluxResultInterface,
};

export interface FluxRepositoryInterface {
  insertLastMonthFlux(): Promise<void>;
  refreshAllFlux(): Promise<void>;
  getMonthlyFlux(params: MonthlyFluxParamsInterface): Promise<MonthlyFluxResultInterface>;
  lastRecordMonthlyFlux(): Promise<lastRecordMonthlyFluxResultInterface>;
  getEvolMonthlyFlux(params: EvolMonthlyFluxParamsInterface): Promise<EvolMonthlyFluxResultInterface>;
  getBestMonthlyFlux(params: BestMonthlyFluxParamsInterface): Promise<BestMonthlyFluxResultInterface>;
}

export abstract class FluxRepositoryInterfaceResolver implements FluxRepositoryInterface {
  async insertLastMonthFlux(): Promise<void> {
    throw new Error();
  }

  async refreshAllFlux(): Promise<void> {
    throw new Error();
  }

  async getMonthlyFlux(params: MonthlyFluxParamsInterface): Promise<MonthlyFluxResultInterface> {
    throw new Error();
  }

  async lastRecordMonthlyFlux(): Promise<lastRecordMonthlyFluxResultInterface> {
    throw new Error();
  }

  async getEvolMonthlyFlux(params: EvolMonthlyFluxParamsInterface): Promise<EvolMonthlyFluxResultInterface> {
    throw new Error();
  }

  async getBestMonthlyFlux(params: BestMonthlyFluxParamsInterface): Promise<BestMonthlyFluxResultInterface> {
    throw new Error();
  }
}
