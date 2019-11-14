// tslint:disable:max-classes-per-file
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { UiStatusInterface } from '~/core/interfaces/campaign/ui-status.interface';
import { RetributionRuleType } from '~/core/interfaces/campaign/api-format/campaign-rules.interface';
import { GlobalRetributionRuleType } from '~/core/interfaces/campaign/api-format/campaign-global-rules.interface';

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
  start_date: Date;
  end_date: Date;
  global_rules: GlobalRetributionRuleType[];
  rules: RetributionRuleType[][];
  _id: string;
}

// export class RetributionRule {
//   slug: RetributionRulesSlugEnum;
//   description?: string;
//   parameters: { [k: string]: any };
//   schema?: object;
//   constructor(obj: RetributionRuleType) {
//     this.slug = obj.slug;
//     this.description = obj.description || '';
//     this.parameters = obj.parameters;
//   }
// }

/*
 * RULES
 * */

//
// export class RestrictionRetributionRule implements RetributionRuleInterface {
//   description?: string;
//   slug: RetributionRulesSlugEnum;
//   parameters: RestrictionParametersInterface;
//   constructor(parameters: RestrictionParametersInterface) {
//     this.slug = RetributionRulesSlugEnum.RESTRICTION;
//     this.parameters = parameters;
//     this.description = '';
//   }
// }

// export class Retribution implements RetributionRuleInterface {
//   slug: RetributionRulesSlugEnum;
//   description?: string;
//   parameters: RetributionParametersInterface;
//   constructor(parameters: RetributionParametersInterface) {
//     this.slug = RetributionRulesSlugEnum.RETRIBUTION;
//     this.parameters = parameters;
//     this.description = '';
//   }
// }

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
