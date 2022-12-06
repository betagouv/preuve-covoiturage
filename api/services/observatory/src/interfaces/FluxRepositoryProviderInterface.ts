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

export {
  InsertLastMonthFluxParamsInterface,
  InsertLastMonthFluxResultInterface,
  refreshAllFluxParamsInterface,
  refreshAllFluxResultInterface,
  MonthlyFluxParamsInterface, 
  MonthlyFluxResultInterface,
  lastRecordMonthlyFluxParamsInterface,
  lastRecordMonthlyFluxResultInterface,
};

export interface FluxRepositoryInterface {
  insertLastMonthFlux(params: InsertLastMonthFluxParamsInterface): Promise<InsertLastMonthFluxResultInterface>;
  refreshAllFlux(params: refreshAllFluxParamsInterface): Promise<refreshAllFluxResultInterface>;
  monthlyFlux(params: MonthlyFluxParamsInterface): Promise<MonthlyFluxResultInterface>;
  lastRecordMonthlyFlux(params: lastRecordMonthlyFluxParamsInterface): Promise<lastRecordMonthlyFluxResultInterface>;
};

export abstract class FluxRepositoryInterfaceResolver implements FluxRepositoryInterface {
  
  async insertLastMonthFlux(params: InsertLastMonthFluxParamsInterface): Promise<InsertLastMonthFluxResultInterface> {
    throw new Error();
  };

  async refreshAllFlux(params: refreshAllFluxParamsInterface): Promise<refreshAllFluxResultInterface> {
    throw new Error();
  };

  async monthlyFlux(params: MonthlyFluxParamsInterface): Promise<MonthlyFluxResultInterface> {
    throw new Error();
  };

  async lastRecordMonthlyFlux(params: lastRecordMonthlyFluxParamsInterface): Promise<lastRecordMonthlyFluxResultInterface> {
    throw new Error();
  };
};