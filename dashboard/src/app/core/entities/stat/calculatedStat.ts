import { StatDateTotalInterface, CalculatedStatInterface } from '../../interfaces/stat/calculatedStatInterface';

export class CalculatedStat {
  public carpoolers: {
    total: number;
    days: StatDateTotalInterface[];
    months: StatDateTotalInterface[];
  };
  // tslint:disable-next-line:variable-name
  public carpoolers_per_vehicule: {
    total: number;
    days: StatDateTotalInterface[];
    months: StatDateTotalInterface[];
  };
  public distance: {
    total: number;
    days: StatDateTotalInterface[];
    months: StatDateTotalInterface[];
  };
  public operators?: {
    total: number;
    imgIds: [];
  };
  public trips: {
    total: number;
    total_subsidized: number;
    days: {
      day: string;
      total: number;
      total_subsidized: number;
    }[];
    months: {
      date: number;
      total: number;
      total_subsidized: number;
    }[];
  };
  constructor(obj: CalculatedStatInterface) {
    this.carpoolers = obj.carpoolers;
    this.carpoolers_per_vehicule = obj.carpoolers_per_vehicule;
    this.distance = obj.distance;
    this.trips = obj.trips;
    if (obj.operators) {
      this.operators = obj.operators;
    }
  }
}
