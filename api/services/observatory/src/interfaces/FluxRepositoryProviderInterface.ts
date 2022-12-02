import {
  ParamsInterface as InsertFluxParamsInterface,
  ResultInterface as InsertFluxResultInterface,
} from '../shared/observatory/insertFlux.contract';
import {
  ParamsInterface as MonthlyFluxParamsInterface,
  ResultInterface as MonthlyFluxResultInterface,
} from '../shared/observatory/monthlyFlux.contract';

export {
  InsertFluxParamsInterface,
  InsertFluxResultInterface,
  MonthlyFluxParamsInterface, 
  MonthlyFluxResultInterface
};

export interface FluxRepositoryInterface {
  insertFlux(params: InsertFluxParamsInterface): Promise<InsertFluxResultInterface>;
  monthlyFlux(params: MonthlyFluxParamsInterface): Promise<MonthlyFluxResultInterface>;
};

export abstract class FluxRepositoryInterfaceResolver implements FluxRepositoryInterface {
  
  async insertFlux(params: InsertFluxParamsInterface): Promise<InsertFluxResultInterface> {
    throw new Error();
  };

  async monthlyFlux(params: MonthlyFluxParamsInterface): Promise<MonthlyFluxResultInterface> {
    throw new Error();
  };
};