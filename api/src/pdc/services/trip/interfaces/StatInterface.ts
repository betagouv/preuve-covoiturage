interface CommonStatInterface {
  distance: number;
  carpoolers: number;
  trip: number;
  average_carpoolers_by_car: number;
  trip_subsidized: number;
  operators: number;
  financial_incentive_sum: number;
  incentive_sum: number;
}

interface StatByMonthInterface extends CommonStatInterface {
  month: number;
}
interface StatByDayInterface extends CommonStatInterface {
  day: Date;
}

export type StatInterface = StatByDayInterface | StatByMonthInterface;

interface CommonFinancialStatInterface {
  incentive_sum: number;
  financial_incentive_sum: number;
}

interface FinancialStatByMonthInterface extends CommonFinancialStatInterface {
  month: number;
}
interface FinancialStatByDayInterface extends CommonFinancialStatInterface {
  day: Date;
}

export type FinancialStatInterface =
  | FinancialStatByMonthInterface
  | FinancialStatByDayInterface;
