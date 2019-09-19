import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { OperatorNameInterface } from '~/core/interfaces/operator/operatorInterface';
import { IncentiveInterface } from '~/core/interfaces/campaign/incentiveInterface';

export class Person {
  operator: OperatorNameInterface;
  operator_id: string;
  // tslint:disable-next-line:variable-name
  is_driver: boolean;
  start_town: string;
  end_town: string;
  rank: TripRankEnum;
  incentives: IncentiveInterface[];

  constructor(obj?: {
    rank: TripRankEnum;
    operator: OperatorNameInterface;
    operator_id: string;
    is_driver: boolean;
    start_town: string;
    end_town: string;
    incentives: IncentiveInterface[];
  }) {
    this.rank = obj.rank;
    this.operator = obj.operator;
    this.operator_id = obj.operator_id;
    this.is_driver = obj.is_driver;
    this.start_town = obj.start_town;
    this.end_town = obj.end_town;
    this.incentives = obj.incentives;
  }
}
