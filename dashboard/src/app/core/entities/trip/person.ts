import { TripClass } from '~/core/entities/trip/trip-class';

export class Person {
  class: TripClass;
  operator: Operator;
  // tslint:disable-next-line:variable-name
  is_driver: boolean;
  start: string;
  end: string;
  incentive: Incentive[];

  constructor(obj?: any) {
    this.class = (obj && obj.class) || null;
    this.operator = (obj && obj.operator) || null;
    this.is_driver = (obj && obj.is_driver) || null;
    this.start = (obj && obj.start) || null;
    this.end = (obj && obj.end) || null;
    this.incentive = (obj && obj.incentive) || null;
  }
}

export class Incentive {
  amount: number;
}
