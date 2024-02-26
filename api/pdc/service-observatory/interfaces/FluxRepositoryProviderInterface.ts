import {
  ParamsInterface as MonthlyFluxParamsInterface,
  ResultInterface as MonthlyFluxResultInterface,
} from '@shared/observatory/flux/monthlyFlux.contract';

// eslint-disable-next-line max-len
import { ResultInterface as lastRecordMonthlyFluxResultInterface } from '@shared/observatory/flux/lastRecordMonthlyFlux.contract';

import {
  ParamsInterface as EvolMonthlyFluxParamsInterface,
  ResultInterface as EvolMonthlyFluxResultInterface,
} from '@shared/observatory/flux/evolMonthlyFlux.contract';

import {
  ParamsInterface as BestMonthlyFluxParamsInterface,
  ResultInterface as BestMonthlyFluxResultInterface,
} from '@shared/observatory/flux/bestMonthlyFlux.contract';

import {
  ParamsInterface as InsertMonthlyFluxParamsInterface,
  ParamsInterface as DeleteMonthlyFluxParamsInterface,
} from '@shared/observatory/flux/insertMonthlyFlux.contract';

export {
  MonthlyFluxParamsInterface,
  MonthlyFluxResultInterface,
  lastRecordMonthlyFluxResultInterface,
  EvolMonthlyFluxParamsInterface,
  EvolMonthlyFluxResultInterface,
  BestMonthlyFluxParamsInterface,
  BestMonthlyFluxResultInterface,
  InsertMonthlyFluxParamsInterface,
  DeleteMonthlyFluxParamsInterface,
};

export interface FluxRepositoryInterface {
  insertOneMonthFlux(params: InsertMonthlyFluxParamsInterface): Promise<void>;
  deleteOneMonthFlux(params: DeleteMonthlyFluxParamsInterface): Promise<void>;
  getMonthlyFlux(params: MonthlyFluxParamsInterface): Promise<MonthlyFluxResultInterface>;
  lastRecordMonthlyFlux(): Promise<lastRecordMonthlyFluxResultInterface>;
  getEvolMonthlyFlux(params: EvolMonthlyFluxParamsInterface): Promise<EvolMonthlyFluxResultInterface>;
  getBestMonthlyFlux(params: BestMonthlyFluxParamsInterface): Promise<BestMonthlyFluxResultInterface>;
}

export abstract class FluxRepositoryInterfaceResolver implements FluxRepositoryInterface {
  async insertOneMonthFlux(params: InsertMonthlyFluxParamsInterface): Promise<void> {
    throw new Error();
  }

  async deleteOneMonthFlux(params: DeleteMonthlyFluxParamsInterface): Promise<void> {
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
