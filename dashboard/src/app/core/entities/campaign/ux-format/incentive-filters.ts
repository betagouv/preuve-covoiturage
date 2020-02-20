// tslint:disable:variable-name
import { RulesRangeUxType } from '~/core/types/campaign/rulesRangeInterface';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';

export interface IncentiveFiltersUxInterface {
  weekday: number[];
  time: IncentiveTimeRuleUxInterface[];
  distance_range: RulesRangeUxType;
  rank: TripRankEnum[];
  operator_ids: number[];
  all_operators: boolean;
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
  context: string;
}

export interface IncentiveTimeRuleUxInterface {
  start: string;
  end: string;
}

export interface IncentiveTimeRuleInterface {
  start: number;
  end: number;
}
