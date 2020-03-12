import { Moment } from 'moment';

import { IncentiveFiltersUxInterface } from '~/core/entities/campaign/ux-format/incentive-filters';
import { RestrictionPeriodsEnum, RestrictionUnitEnum } from '~/core/enums/campaign/restrictions.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { UiStatusInterface } from '~/core/interfaces/campaign/ui-status.interface';

export interface CampaignUXInterface {
  _id: number;
  start: Moment;
  end: Moment;
  territory_id: number;
  name: string;
  description: string;
  status: CampaignStatusEnum;
  unit: IncentiveUnitEnum;
  parent_id: number;
  amount_spent?: number;
  trips_number?: number;
  ui_status: UiStatusInterface;
  filters: IncentiveFiltersUxInterface;
  retributions: RetributionUxInterface[];
  max_trips: number;
  max_amount: number;
  only_adult: boolean;
  restrictions: RestrictionUxInterface[];
  passenger_seat: boolean;
}

export interface RetributionUxInterface {
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

export interface RestrictionUxInterface {
  quantity: number;
  is_driver: boolean;
  unit: RestrictionUnitEnum;
  period: RestrictionPeriodsEnum;
}
