import { StatDateTotal, StatInterface } from '../../interfaces/stat/statInterface';

export class Stat {
  public carpoolers: {
    total: number;
    days: StatDateTotal[];
    months: StatDateTotal[];
  };
  // tslint:disable-next-line:variable-name
  public carpoolers_per_vehicule: {
    total: number;
    days: StatDateTotal[];
  };
  public distance: {
    total: number;
    days: StatDateTotal[];
    months: StatDateTotal[];
  };
  public operators: {
    total: number;
    imgIds: [];
  };
  public trips: {
    total: number;
    total_subsidized: number;
    days: {
      date: string;
      total: number;
      total_subsidized: number;
    }[];
    months: {
      date: string;
      total: number;
      total_subsidized: number;
    }[];
  };
  constructor(obj: StatInterface) {
    this.carpoolers = obj.carpoolers;
    this.carpoolers_per_vehicule = obj.carpoolers_per_vehicule;
    this.distance = obj.distance;
    this.operators = obj.operators;
    this.trips = obj.trips;
  }
}
