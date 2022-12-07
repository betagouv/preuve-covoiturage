import {
  ParamsInterface as InsertLastMonthOccupationParamsInterface,
  ResultInterface as InsertLastMonthOccupationResultInterface,
} from '../shared/observatory/occupation/insertLastMonthOccupation.contract';
import {
  ParamsInterface as refreshAllOccupationParamsInterface,
  ResultInterface as refreshAllOccupationResultInterface,
} from '../shared/observatory/occupation/refreshAllOccupation.contract';
import {
  ParamsInterface as MonthlyOccupationParamsInterface,
  ResultInterface as MonthlyOccupationResultInterface,
} from '../shared/observatory/occupation/monthlyOccupation.contract';
import {
  ParamsInterface as EvolMonthlyOccupationParamsInterface,
  ResultInterface as EvolMonthlyOccupationResultInterface,
} from '../shared/observatory/occupation/evolMonthlyOccupation.contract';


export {
  InsertLastMonthOccupationParamsInterface,
  InsertLastMonthOccupationResultInterface,
  refreshAllOccupationParamsInterface,
  refreshAllOccupationResultInterface,
  MonthlyOccupationParamsInterface, 
  MonthlyOccupationResultInterface,
  EvolMonthlyOccupationParamsInterface,
  EvolMonthlyOccupationResultInterface,
};

export interface OccupationRepositoryInterface {
  insertLastMonthOccupation(params: InsertLastMonthOccupationParamsInterface): Promise<InsertLastMonthOccupationResultInterface>;
  refreshAllOccupation(params: refreshAllOccupationParamsInterface): Promise<refreshAllOccupationResultInterface>;
  getMonthlyOccupation(params: MonthlyOccupationParamsInterface): Promise<MonthlyOccupationResultInterface>;
  getEvolMonthlyOccupation(params: EvolMonthlyOccupationParamsInterface): Promise<EvolMonthlyOccupationResultInterface>;
};

export abstract class OccupationRepositoryInterfaceResolver implements OccupationRepositoryInterface {
  
  async insertLastMonthOccupation(params: InsertLastMonthOccupationParamsInterface): Promise<InsertLastMonthOccupationResultInterface> {
    throw new Error();
  };

  async refreshAllOccupation(params: refreshAllOccupationParamsInterface): Promise<refreshAllOccupationResultInterface> {
    throw new Error();
  };

  async getMonthlyOccupation(params: MonthlyOccupationParamsInterface): Promise<MonthlyOccupationResultInterface> {
    throw new Error();
  };
  
  async getEvolMonthlyOccupation(params: EvolMonthlyOccupationParamsInterface): Promise<EvolMonthlyOccupationResultInterface> {
    throw new Error();
  };
};