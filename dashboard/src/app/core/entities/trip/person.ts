import { TripClass } from '~/core/entities/trip/trip-class';

export class Person {
  class: TripClass;
  operator: Operator;
  // tslint:disable-next-line:variable-name
  is_driver: boolean;
  start: string;
  end: string;
  incentives: Incentive[];

  constructor(obj?: {
    class: TripClass;
    operator: Operator;
    is_driver: boolean;
    start: string;
    end: string;
    incentives: Incentive[];
  }) {
    this.class = obj.class;
    this.operator = obj.operator;
    this.is_driver = obj.is_driver;
    this.start = obj.start;
    this.end = obj.end;
    this.incentives = obj.incentives;
  }
}

export class Incentive {
  amount: number;
}
