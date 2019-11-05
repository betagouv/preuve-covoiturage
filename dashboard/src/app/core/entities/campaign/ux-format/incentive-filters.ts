// tslint:disable:variable-name
import { TripRankEnum } from '../../../enums/trip/trip-rank.enum';
import { RulesRangeUxType } from '../../../types/campaign/rulesRangeInterface';

// export class IncentiveFiltersUx {
//   weekday: number[];
//   time: IncentiveTimeRuleUxInterface[];
//   distance_range: RulesRangeUxType;
//   rank: TripRankEnum[];
//   operator_ids: string[];
//   constructor(obj: IncentiveFiltersUxInterface) {
//     this.weekday = obj.weekday;
//     this.time = obj.time;
//     this.distance_range = obj.distance_range;
//     this.rank = obj.rank;
//     this.operator_ids = obj.operator_ids;
//   }
// }

export interface IncentiveFiltersUxInterface {
  weekday: number[];
  time: IncentiveTimeRuleUxInterface[];
  distance_range: RulesRangeUxType;
  rank: TripRankEnum[];
  operator_ids: string[];
  insee: {
    blackList: IncentiveInseeFilterInterface[];
    whiteList: IncentiveInseeFilterInterface[];
  };
}

export interface IncentiveInseeFilterInterface {
  start: InseeAndTerritoryInterface[];
  end: InseeAndTerritoryInterface[];
}

export interface InseeAndTerritoryInterface {
  territory_literal: string;
  insees: string[];
}

export interface IncentiveTimeRuleUxInterface {
  start: string;
  end: string;
}

export interface IncentiveTimeRuleInterface {
  start: number;
  end: number;
}
