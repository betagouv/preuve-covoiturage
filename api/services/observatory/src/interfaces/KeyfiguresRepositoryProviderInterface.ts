import {
  ParamsInterface as MonthlyKeyfiguresParamsInterface,
  ResultInterface as MonthlyKeyfiguresResultInterface,
} from '../shared/observatory/keyfigures/monthlyKeyfigures.contract';

export { MonthlyKeyfiguresParamsInterface, MonthlyKeyfiguresResultInterface };

export interface KeyfiguresRepositoryInterface {
  getMonthlyKeyfigures(params: MonthlyKeyfiguresParamsInterface): Promise<MonthlyKeyfiguresResultInterface>;
}

export abstract class KeyfiguresRepositoryInterfaceResolver implements KeyfiguresRepositoryInterface {
  async getMonthlyKeyfigures(params: MonthlyKeyfiguresParamsInterface): Promise<MonthlyKeyfiguresResultInterface> {
    throw new Error();
  }
}
