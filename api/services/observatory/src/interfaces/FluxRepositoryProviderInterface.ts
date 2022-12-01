import {
  ParamsInterface as MonthlyFluxParamsInterface,
  ResultInterface as MonthlyFluxResultInterface,
} from '../shared/observatory/monthlyFlux.contract';

export {MonthlyFluxParamsInterface, MonthlyFluxResultInterface};

export interface FluxRepositoryInterface {
  monthlyFlux(params: MonthlyFluxParamsInterface): Promise<MonthlyFluxResultInterface>;
}

export abstract class FluxRepositoryInterfaceResolver implements FluxRepositoryInterface {
  async monthlyFlux(params: MonthlyFluxParamsInterface): Promise<MonthlyFluxResultInterface> {
    throw new Error();
  }
}