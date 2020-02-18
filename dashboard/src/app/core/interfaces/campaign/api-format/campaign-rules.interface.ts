// tslint:disable:max-classes-per-file

import { RulesRangeInterface } from '~/core/types/campaign/rulesRangeInterface';

export interface BaseRetributionRuleInterface {
  slug: string;
  description?: string;
  parameters: any;
  schema?: object;
}

export enum RetributionRulesSlugEnum {
  DISTANCE_RANGE = 'distance_range_filter',
  PER_KM = 'per_km_modifier',
  FREE = 'cost_based_amount',
  FOR_DRIVER = 'driver_only_filter',
  FOR_PASSENGER = 'passenger_only_filter',
  PER_PASSENGER = 'per_passenger_modifier',
  AMOUNT = 'fixed_amount_setter',
}

export type RetributionRuleType =
  | RangeRetributionRule
  | PerKmRetributionRule
  | PerPassengerRetributionRule
  | AmountRetributionRule
  | ForDriverRetributionRule
  | FreeRetributionRule
  | ForPassengerRetributionRule;

export interface RetributionRuleInterface extends BaseRetributionRuleInterface {
  slug: RetributionRulesSlugEnum;
}

export class RangeRetributionRule implements RetributionRuleInterface {
  description?: string;
  parameters: RulesRangeInterface;
  slug: RetributionRulesSlugEnum;

  constructor(distanceRange: RulesRangeInterface) {
    this.slug = RetributionRulesSlugEnum.DISTANCE_RANGE;
    this.parameters = distanceRange;
  }
}

export class PerKmRetributionRule implements RetributionRuleInterface {
  description?: string;
  slug: RetributionRulesSlugEnum;
  parameters: boolean;

  constructor() {
    this.slug = RetributionRulesSlugEnum.PER_KM;
  }
}

export class PerPassengerRetributionRule implements RetributionRuleInterface {
  description?: string;
  slug: RetributionRulesSlugEnum;
  parameters: boolean;

  constructor() {
    this.slug = RetributionRulesSlugEnum.PER_PASSENGER;
  }
}

export class ForDriverRetributionRule implements RetributionRuleInterface {
  description?: string;
  slug: RetributionRulesSlugEnum;
  parameters: boolean;

  constructor() {
    this.slug = RetributionRulesSlugEnum.FOR_DRIVER;
  }
}

export class ForPassengerRetributionRule implements RetributionRuleInterface {
  description?: string;
  slug: RetributionRulesSlugEnum;
  parameters: boolean;

  constructor() {
    this.slug = RetributionRulesSlugEnum.FOR_PASSENGER;
  }
}

export class AmountRetributionRule implements RetributionRuleInterface {
  description?: string;
  slug: RetributionRulesSlugEnum;
  parameters: number;

  constructor(amount: number) {
    this.slug = RetributionRulesSlugEnum.AMOUNT;
    this.parameters = amount;
  }
}

export class FreeRetributionRule implements RetributionRuleInterface {
  description?: string;
  slug: RetributionRulesSlugEnum;
  parameters: boolean;

  constructor() {
    this.slug = RetributionRulesSlugEnum.FREE;
  }
}
