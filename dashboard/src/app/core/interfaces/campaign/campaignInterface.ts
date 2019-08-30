import { Territory } from '~/core/entities/territory/territory';
import { IncentiveRules } from '~/core/entities/campaign/incentive-rules';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

export interface CreateCampaignInterface {
  name: string;
  description: string;
  territory?: Territory;
  start: Date;
  end: Date;
  status: CampaignStatusEnum;
  amount_unit?: IncentiveUnitEnum;
  /* tslint:disable:variable-name */
  max_trips: number;
  max_amount: number;
  trips_number?: number;
  amount_spent?: number;
  rules?: IncentiveRules;
  parameters?: any;
  formula_expression: string;
  formulas: IncentiveFormulaInterface[];
}

export interface CampaignInterface extends CreateCampaignInterface {
  _id: string;
}

export interface IncentiveFormulaInterface {
  formula: string;
}

export interface IncentiveFormulaParameterInterface {
  _id?: string;
  varname: string;
  internal: boolean;
  helper: string;
  value?: string | number | boolean | null;
  formula?: string;
}

export type FormulaUnitType = 'euro' | 'point';
