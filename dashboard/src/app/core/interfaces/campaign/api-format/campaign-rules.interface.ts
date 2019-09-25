// tslint:disable:max-classes-per-file

import { RulesRangeInterface } from '~/core/types/campaign/rulesRangeInterface';

export interface BaseRetributionRuleInterface {
  slug: string;
  description?: string;
  parameters?: { [k: string]: any };
  schema?: object;
}

export enum RetributionRulesSlugEnum {
  DISTANCE_RANGE = 'distance_range',
  PER_KM = 'per_km',
  FREE = 'free',
  FOR_DRIVER = 'target_driver',
  FOR_PASSENGER = 'target_passenger',
  PER_PASSENGER = 'per_passenger',
  AMOUNT = 'static_amount',
}

export type RetributionRuleType =
  | RangeRetributionRule
  | PerKmRetributionRule
  | PerPassengerRetributionRule
  | AmountRetributionRule
  | ForDriverRetributionRule
  | FreeRetributionRule
  | ForPassengerRetributionRule
  | FreeRetributionRule;

export interface RetributionRuleInterface extends BaseRetributionRuleInterface {
  slug: RetributionRulesSlugEnum;
}

export class RangeRetributionRule implements RetributionRuleInterface {
  description?: string;
  parameters: {
    distance_range: RulesRangeInterface;
  };
  slug: RetributionRulesSlugEnum;

  constructor(distanceRange: RulesRangeInterface) {
    this.slug = RetributionRulesSlugEnum.DISTANCE_RANGE;
    this.parameters = {
      distance_range: distanceRange,
    };
  }
}

export class PerKmRetributionRule implements RetributionRuleInterface {
  description?: string;
  slug: RetributionRulesSlugEnum;

  constructor() {
    this.slug = RetributionRulesSlugEnum.PER_KM;
  }
}

export class PerPassengerRetributionRule implements RetributionRuleInterface {
  description?: string;
  slug: RetributionRulesSlugEnum;

  constructor() {
    this.slug = RetributionRulesSlugEnum.PER_PASSENGER;
  }
}

export class ForDriverRetributionRule implements RetributionRuleInterface {
  description?: string;
  slug: RetributionRulesSlugEnum;

  constructor() {
    this.slug = RetributionRulesSlugEnum.FOR_DRIVER;
  }
}

export class ForPassengerRetributionRule implements RetributionRuleInterface {
  description?: string;
  slug: RetributionRulesSlugEnum;

  constructor() {
    this.slug = RetributionRulesSlugEnum.FOR_PASSENGER;
  }
}

export class AmountRetributionRule implements RetributionRuleInterface {
  description?: string;
  slug: RetributionRulesSlugEnum;
  parameters: {
    amount: number;
  };

  constructor(amount: number) {
    this.slug = RetributionRulesSlugEnum.AMOUNT;
    this.parameters = {
      amount,
    };
  }
}

export class FreeRetributionRule implements RetributionRuleInterface {
  description?: string;
  slug: RetributionRulesSlugEnum;

  constructor() {
    this.slug = RetributionRulesSlugEnum.FREE;
  }
}
