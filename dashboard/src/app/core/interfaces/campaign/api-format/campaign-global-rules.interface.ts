import { WeekDay } from '@angular/common';

// tslint:disable:max-classes-per-file
import { BaseRetributionRuleInterface } from '~/core/interfaces/campaign/api-format/campaign-rules.interface';
import { IncentiveTimeRuleInterface } from '~/core/entities/campaign/ux-format/incentive-filters';
import { RulesRangeInterface } from '~/core/types/campaign/rulesRangeInterface';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { RestrictionPeriodsEnum, RestrictionTargetsEnum } from '~/core/enums/campaign/restrictions.enum';

export type GlobalRetributionRuleType =
  | MaxAmountRetributionRule
  | MaxTripsRetributionRule
  | WeekdayRetributionRule
  | TimeRetributionRule
  | DistanceRangeGlobalRetributionRule
  | RankGlobalRetributionRule
  | OnlyAdultRetributionRule
  | OperatorIdsGlobalRetributionRule
  | WhiteListGlobalRetributionRule
  | BlackListGlobalRetributionRule;

export enum GlobalRetributionRulesSlugEnum {
  MAX_AMOUNT = 'max_amount_restriction',
  RESTRICTION_TRIP = 'max_trip_per_target_restriction',
  RESTRICTION_AMOUNT = 'max_amount_per_target_restriction',
  MAX_TRIPS = 'max_trip_restriction',
  ONLY_ADULT = 'adult_only_filter',
  WEEKDAY = 'weekday_filter',
  TIME = 'time_range_filter',
  DISTANCE_RANGE = 'distance_range_filter',
  RANK = 'rank_whitelist_filter',
  OPERATOR_IDS = 'operator_whitelist_filter',
  WHITELIST = 'insee_whitelist_filter',
  BLACKLIST = 'insee_blacklist_filter',
}

export interface GlobalRetributionRuleInterface extends BaseRetributionRuleInterface {
  slug: GlobalRetributionRulesSlugEnum;
}

export class OnlyAdultRetributionRule implements GlobalRetributionRuleInterface {
  description?: string;
  slug: GlobalRetributionRulesSlugEnum;
  parameters: boolean;

  constructor() {
    this.slug = GlobalRetributionRulesSlugEnum.ONLY_ADULT;
    this.parameters = true;
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
  parameters: WeekDay[];

  constructor(weekday: WeekDay[]) {
    this.slug = GlobalRetributionRulesSlugEnum.WEEKDAY;
    this.parameters = weekday;
  }
}

export class TimeRetributionRule implements GlobalRetributionRuleInterface {
  slug: GlobalRetributionRulesSlugEnum;
  description?: string;
  parameters: IncentiveTimeRuleInterface[];

  constructor(time: IncentiveTimeRuleInterface[]) {
    this.slug = GlobalRetributionRulesSlugEnum.TIME;
    this.parameters = time;
  }
}

export class DistanceRangeGlobalRetributionRule implements GlobalRetributionRuleInterface {
  slug: GlobalRetributionRulesSlugEnum;
  description?: string;
  parameters: RulesRangeInterface;

  constructor(distanceRange: RulesRangeInterface) {
    this.slug = GlobalRetributionRulesSlugEnum.DISTANCE_RANGE;
    this.parameters = distanceRange;
  }
}

export class RankGlobalRetributionRule implements GlobalRetributionRuleInterface {
  slug: GlobalRetributionRulesSlugEnum;
  description?: string;
  parameters: TripRankEnum[];

  constructor(rank: TripRankEnum[]) {
    this.slug = GlobalRetributionRulesSlugEnum.RANK;
    this.parameters = rank;
  }
}

export class OperatorIdsGlobalRetributionRule implements GlobalRetributionRuleInterface {
  slug: GlobalRetributionRulesSlugEnum;
  description?: string;
  parameters: number[];

  constructor(operatorIds: number[]) {
    this.slug = GlobalRetributionRulesSlugEnum.OPERATOR_IDS;
    this.parameters = operatorIds;
  }
}

export class TripRestrictionRetributionRule implements GlobalRetributionRuleInterface {
  description?: string;
  slug: GlobalRetributionRulesSlugEnum;
  parameters: {
    target: RestrictionTargetsEnum;
    amount: number;
    period: RestrictionPeriodsEnum;
  };

  constructor(target: RestrictionTargetsEnum, amount: number, period: RestrictionPeriodsEnum) {
    this.slug = GlobalRetributionRulesSlugEnum.RESTRICTION_TRIP;
    this.parameters = {
      target,
      amount,
      period,
    };
  }
}

export class AmountRestrictionRetributionRule implements GlobalRetributionRuleInterface {
  description?: string;
  slug: GlobalRetributionRulesSlugEnum;
  parameters: {
    target: RestrictionTargetsEnum;
    amount: number;
    period: RestrictionPeriodsEnum;
  };

  constructor(target: RestrictionTargetsEnum, amount: number, period: RestrictionPeriodsEnum) {
    this.slug = GlobalRetributionRulesSlugEnum.RESTRICTION_AMOUNT;
    this.parameters = {
      target,
      amount,
      period,
    };
  }
}

export type BlackListWhiteListGlobalRetributionRuleType = {
  start: string[];
  end: string[];
}[];

export class BlackListGlobalRetributionRule implements GlobalRetributionRuleInterface {
  slug: GlobalRetributionRulesSlugEnum;
  description?: string;
  parameters: BlackListWhiteListGlobalRetributionRuleType;
  constructor(params: BlackListWhiteListGlobalRetributionRuleType) {
    this.slug = GlobalRetributionRulesSlugEnum.BLACKLIST;
    this.parameters = params;
  }
}

export class WhiteListGlobalRetributionRule implements GlobalRetributionRuleInterface {
  slug: GlobalRetributionRulesSlugEnum;
  description?: string;
  parameters: BlackListWhiteListGlobalRetributionRuleType;

  constructor(params: BlackListWhiteListGlobalRetributionRuleType) {
    this.slug = GlobalRetributionRulesSlugEnum.WHITELIST;
    this.parameters = params;
  }
}
