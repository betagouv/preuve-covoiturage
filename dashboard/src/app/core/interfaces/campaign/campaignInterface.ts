// tslint:disable:max-classes-per-file
import { Moment } from 'moment';

import { IncentiveFiltersInterface, IncentiveFiltersUxInterface } from '~/core/entities/campaign/incentive-filters';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { restrictionEnum } from '~/core/enums/campaign/restrictions.enum';
import { UiStatusInterface } from '~/core/interfaces/campaign/ui-status.interface';

export interface BaseCampaignInterface {
  name: string;
  description: string;
  territory_id?: string;
  status: CampaignStatusEnum;
  unit: IncentiveUnitEnum;
  parent_id: string;
  amount_spent?: number;
  trips_number?: number;
  ui_status: UiStatusInterface;
}

export interface CampaignInterface extends BaseCampaignInterface {
  start: Date;
  end: Date;
  retribution_rules: RetributionRuleType[];
  filters: IncentiveFiltersInterface;
  _id: string;
}

export interface CampaignUXInterface extends BaseCampaignInterface {
  _id: string;
  start: Moment;
  end: Moment;
  filters: IncentiveFiltersUxInterface;
  retributions: RetributionParametersInterface[];
  max_trips: number;
  max_amount: number;
  only_adult: boolean;
  restrictions: RestrictionParametersInterface[];
}

export enum RetributionRulesSlugEnum {
  ONLY_ADULT = 'adult_only',
  MAX_AMOUNT = 'max_amount',
  MAX_TRIPS = 'max_trip',
  RESTRICTION = 'restriction',
  RETRIBUTION = 'retribution_meltingpot',
}

export type RetributionRuleType =
  | OnlyAdultRetributionRule
  | RestrictionRetributionRule
  | Retribution
  | MaxAmountRetributionRule
  | MaxTripsRetributionRule;

export class RetributionRule {
  slug: RetributionRulesSlugEnum;
  description?: string;
  parameters: { [k: string]: any };
  schema?: object;
  constructor(obj: RetributionRuleType) {
    this.slug = obj.slug;
    this.description = obj.description || '';
    this.parameters = obj.parameters;
  }
}

export interface RetributionRuleInterface {
  slug: RetributionRulesSlugEnum;
  description?: string;
  parameters: { [k: string]: any };
  schema?: object;
}

export class OnlyAdultRetributionRule implements RetributionRuleInterface {
  description?: string;
  slug: RetributionRulesSlugEnum;
  parameters: {
    only_adult: boolean;
  };
  constructor() {
    this.slug = RetributionRulesSlugEnum.ONLY_ADULT;
    this.description = '';
  }
}

export class MaxAmountRetributionRule implements RetributionRuleInterface {
  description?: string;
  slug: RetributionRulesSlugEnum;
  parameters: {
    amount: number;
    period: string;
  };
  constructor(maxAmount: number) {
    this.slug = RetributionRulesSlugEnum.MAX_AMOUNT;
    this.parameters = {
      amount: maxAmount,
      period: 'campaign',
    };
    this.description = '';
  }
}

export class MaxTripsRetributionRule implements RetributionRuleInterface {
  slug: RetributionRulesSlugEnum;
  description?: string;
  parameters: {
    amount: number;
    period: string;
  };
  constructor(maxTrips: number) {
    this.slug = RetributionRulesSlugEnum.MAX_TRIPS;
    this.parameters = {
      amount: maxTrips,
      period: 'campaign',
    };
    this.description = '';
  }
}

export class RestrictionRetributionRule implements RetributionRuleInterface {
  description?: string;
  slug: RetributionRulesSlugEnum;
  parameters: RestrictionParametersInterface;
  constructor(parameters: RestrictionParametersInterface) {
    this.slug = RetributionRulesSlugEnum.RESTRICTION;
    this.parameters = parameters;
    this.description = '';
  }
}

export interface RestrictionParametersInterface {
  quantity: number;
  is_driver: boolean;
  period: restrictionEnum;
}

export class Retribution implements RetributionRuleInterface {
  slug: RetributionRulesSlugEnum;
  description?: string;
  parameters: RetributionParametersInterface;
  constructor(parameters: RetributionParametersInterface) {
    this.slug = RetributionRulesSlugEnum.RETRIBUTION;
    this.parameters = parameters;
    this.description = '';
  }
}

export interface RetributionParametersInterface {
  max: number;
  min: number;
  for_driver: {
    per_km: boolean;
    per_passenger: boolean;
    amount: number;
  };
  for_passenger: {
    free: boolean;
    per_km: boolean;
    amount: number;
  };
}

// export interface IncentiveFormulaParameterInterface {
//   _id?: string;
//   varname: string;
//   internal: boolean;
//   helper: string;
//   value?: string | number | boolean | null;
//   formula?: string;
// }

// export interface IncentiveFormulaInterface {
//   formula: string;
// }
