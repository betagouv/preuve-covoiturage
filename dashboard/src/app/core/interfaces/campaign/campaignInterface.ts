import { Territory } from '~/core/entities/territory/territory';
import { IncentiveRules } from '~/core/entities/campaign/incentive-rules';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

export interface CampaignInterface {
  _id: string;
  name: string;
  description: string;
  territory?: Territory;
  start: Date;
  end: Date;
  status: CampaignStatusEnum;
  /* tslint:disable:variable-name */
  max_trips: number;
  max_amount: number;
  trips_number?: number;
  amount_spent?: number;
  rules?: IncentiveRules;
  parameters?: any;
  amount_unit?: IncentiveUnitEnum;
}
