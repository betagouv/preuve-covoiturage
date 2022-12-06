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


export {
  InsertLastMonthOccupationParamsInterface,
  InsertLastMonthOccupationResultInterface,
  refreshAllOccupationParamsInterface,
  refreshAllOccupationResultInterface,
  MonthlyOccupationParamsInterface, 
  MonthlyOccupationResultInterface,
};

export interface OccupationRepositoryInterface {
  insertLastMonthOccupation(params: InsertLastMonthOccupationParamsInterface): Promise<InsertLastMonthOccupationResultInterface>;
  refreshAllOccupation(params: refreshAllOccupationParamsInterface): Promise<refreshAllOccupationResultInterface>;
  monthlyOccupation(params: MonthlyOccupationParamsInterface): Promise<MonthlyOccupationResultInterface>;
};

export abstract class OccupationRepositoryInterfaceResolver implements OccupationRepositoryInterface {
  
  async insertLastMonthOccupation(params: InsertLastMonthOccupationParamsInterface): Promise<InsertLastMonthOccupationResultInterface> {
    throw new Error();
  };

  async refreshAllOccupation(params: refreshAllOccupationParamsInterface): Promise<refreshAllOccupationResultInterface> {
    throw new Error();
  };

  async monthlyOccupation(params: MonthlyOccupationParamsInterface): Promise<MonthlyOccupationResultInterface> {
    throw new Error();
  };
};