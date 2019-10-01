import { WeekDay } from '@angular/common';

// tslint:disable:max-classes-per-file
import {
  BaseRetributionRuleInterface,
  RetributionRuleInterface,
} from '~/core/interfaces/campaign/api-format/campaign-rules.interface';
import { IncentiveTimeRuleInterface } from '~/core/entities/campaign/ux-format/incentive-filters';
import { RulesRangeInterface } from '~/core/types/campaign/rulesRangeInterface';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';

export type GlobalRetributionRuleType =
  | MaxAmountRetributionRule
  | MaxTripsRetributionRule
  | WeekdayRetributionRule
  | TimeRetributionRule
  | DistanceRangeGlobalRetributionRule
  | RankRetributionRule
  | OnlyAdultRetributionRule
  | OperatorIdsRetributionRule;

export enum GlobalRetributionRulesSlugEnum {
  MAX_AMOUNT = 'max_amount_restriction',
  MAX_TRIPS = 'max_trip_restriction',
  ONLY_ADULT = 'adult_only_filter',
  WEEKDAY = 'weekday_filter',
  TIME = 'time_range_filter',
  DISTANCE_RANGE = 'distance_range_filter',
  RANK = 'rank_whitelist_filter',
  OPERATOR_IDS = 'operator_whitelist_filter',
}

export interface GlobalRetributionRuleInterface extends BaseRetributionRuleInterface {
  slug: GlobalRetributionRulesSlugEnum;
}

export class OnlyAdultRetributionRule implements GlobalRetributionRuleInterface {
  description?: string;
  slug: GlobalRetributionRulesSlugEnum;

  constructor() {
    this.slug = GlobalRetributionRulesSlugEnum.ONLY_ADULT;
  }
}

export class MaxAmountRetributionRule implements GlobalRetributionRuleInterface {
  description?: string;
  slug: GlobalRetributionRulesSlugEnum;
  parameters: {
    amount: number;
    period: string;
  };
  constructor(maxAmount: number) {
    this.slug = GlobalRetributionRulesSlugEnum.MAX_AMOUNT;
    this.parameters = {
      amount: maxAmount,
      period: 'campaign',
    };
  }
}

export class MaxTripsRetributionRule implements GlobalRetributionRuleInterface {
  slug: GlobalRetributionRulesSlugEnum;
  description?: string;
  parameters: {
    amount: number;
    period: string;
  };
  constructor(maxTrips: number) {
    this.slug = GlobalRetributionRulesSlugEnum.MAX_TRIPS;
    this.parameters = {
      amount: maxTrips,
      period: 'campaign',
    };
  }
}

export class WeekdayRetributionRule implements GlobalRetributionRuleInterface {
  slug: GlobalRetributionRulesSlugEnum;
  description?: string;
  parameters: {
    weekday: WeekDay[];
  };
  constructor(weekday: WeekDay[]) {
    this.slug = GlobalRetributionRulesSlugEnum.WEEKDAY;
    this.parameters = {
      weekday,
    };
  }
}

export class TimeRetributionRule implements GlobalRetributionRuleInterface {
  slug: GlobalRetributionRulesSlugEnum;
  description?: string;
  parameters: {
    time: IncentiveTimeRuleInterface[];
  };
  constructor(time: IncentiveTimeRuleInterface[]) {
    this.slug = GlobalRetributionRulesSlugEnum.TIME;
    this.parameters = {
      time,
    };
  }
}

export class DistanceRangeGlobalRetributionRule implements GlobalRetributionRuleInterface {
  slug: GlobalRetributionRulesSlugEnum;
  description?: string;
  parameters: {
    distance_range: RulesRangeInterface;
  };
  constructor(distanceRange: RulesRangeInterface) {
    this.slug = GlobalRetributionRulesSlugEnum.DISTANCE_RANGE;
    this.parameters = {
      distance_range: distanceRange,
    };
  }
}

export class RankRetributionRule implements GlobalRetributionRuleInterface {
  slug: GlobalRetributionRulesSlugEnum;
  description?: string;
  parameters: {
    rank: TripRankEnum[];
  };
  constructor(rank: TripRankEnum[]) {
    this.slug = GlobalRetributionRulesSlugEnum.RANK;
    this.parameters = {
      rank,
    };
  }
}

export class OperatorIdsRetributionRule implements GlobalRetributionRuleInterface {
  slug: GlobalRetributionRulesSlugEnum;
  description?: string;
  parameters: {
    operators_id: string[];
  };
  constructor(operatorIds: string[]) {
    this.slug = GlobalRetributionRulesSlugEnum.OPERATOR_IDS;
    this.parameters = {
      operators_id: operatorIds,
    };
  }
}
