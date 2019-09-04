import { Territory } from '~/core/entities/territory/territory';
import { CampaignStatus } from '~/core/entities/campaign/campaign-status';
import { IncentiveRules } from '~/core/entities/campaign/incentive-rules';
import { IncentiveUnit } from '~/core/entities/campaign/IncentiveUnit';
import { restrictionEnum } from '~/core/enums/campaign/restrictions.enum';

export interface CreateCampaignInterface {
  name: string;
  description: string;
  territory?: Territory;
  start: Date;
  end: Date;
  status: CampaignStatus;
  template_id: string;
  amount_unit: IncentiveUnit;
  max_trips: number;
  max_amount: number;
  trips_number?: number;
  amount_spent?: number;
  rules?: IncentiveRules;
  restrictions: RestrictionInterface[];
  parameters?: any;
  formula_expression: string;
  formulas: IncentiveFormulaInterface[];
  expertMode: boolean;
}

export interface CampaignInterface extends CreateCampaignInterface {
  _id: string;
}

// tslint:disable-next-line:no-empty-interface
export interface TemplateInterface extends CreateCampaignInterface {}

export interface IncentiveFormulaInterface {
  formula: string;
}

export interface RestrictionInterface {
  quantity: number;
  is_driver: boolean;
  period: restrictionEnum;
}

export interface IncentiveFormulaParameterInterface {
  _id?: string;
  varname: string;
  internal: boolean;
  helper: string;
  value?: string | number | boolean | null;
  formula?: string;
}
