// tslint:disable:variable-name
import { TripRankEnum } from '../../enums/trip/trip-rank.enum';
import { RulesRangeInterface, RulesRangeUxType } from '../../types/campaign/rulesRangeInterface';

export class IncentiveFiltersUx {
  weekday: number[];
  time: IncentiveTimeRuleInterface[];
  distance_range: RulesRangeUxType;
  rank: TripRankEnum[];
  operator_ids: string[];
  constructor(obj: IncentiveFiltersUxInterface) {
    this.weekday = obj.weekday;
    this.time = obj.time;
    this.distance_range = obj.distance_range;
    this.rank = obj.rank;
    this.operator_ids = obj.operator_ids;
  }
}

export interface IncentiveFiltersInterface {
  weekday: number[];
  time: IncentiveTimeRuleInterface[];
  distance_range: RulesRangeInterface;
  rank: TripRankEnum[];
  operator_ids: string[];
}

export interface IncentiveFiltersUxInterface {
  weekday: number[];
  time: IncentiveTimeRuleInterface[];
  distance_range: RulesRangeUxType;
  rank: TripRankEnum[];
  operator_ids: string[];
}

export interface IncentiveTimeRuleInterface {
  start: string;
  end: string;
}
