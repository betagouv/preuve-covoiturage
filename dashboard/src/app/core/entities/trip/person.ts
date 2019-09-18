import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { OperatorNameInterface } from '~/core/interfaces/operator/operatorInterface';
import { IncentiveInterface } from '~/core/interfaces/campaign/incentiveInterface';

export class Person {
  class: TripRankEnum;
  operator: OperatorNameInterface;
  // tslint:disable-next-line:variable-name
  is_driver: boolean;
  start: string;
  end: string;
  incentives: IncentiveInterface[];

  constructor(obj?: {
    class: TripRankEnum;
    operator: OperatorNameInterface;
    is_driver: boolean;
    start: string;
    end: string;
    incentives: IncentiveInterface[];
  }) {
    this.class = obj.class;
    this.operator = obj.operator;
    this.is_driver = obj.is_driver;
    this.start = obj.start;
    this.end = obj.end;
    this.incentives = obj.incentives;
  }
}
