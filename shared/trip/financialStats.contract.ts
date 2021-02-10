import { TripStatInterface } from './common/interfaces/TripStatInterface';

export interface ParamsInterface extends TripStatInterface {}

interface CommonStatInterface {
  incentive_sum: number;
  financial_incentive_sum: number;
}

interface StatByMonthInterface extends CommonStatInterface {
  month: number;
}
interface StatByDayInterface extends CommonStatInterface {
  day: Date;
}

export type SingleResultInterface = StatByDayInterface | StatByMonthInterface;

export type ResultInterface = SingleResultInterface[];

export const handlerConfig = {
  service: 'trip',
  method: 'financialStats',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
