import { Moment } from 'moment';

import { IncentiveFiltersUxInterface } from '~/core/entities/campaign/ux-format/incentive-filters';
import { BaseCampaignInterface } from '~/core/interfaces/campaign/api-format/campaignInterface';
import { RestrictionPeriodsEnum } from '~/core/enums/campaign/restrictions.enum';

export interface CampaignUXInterface extends BaseCampaignInterface {
  _id: string;
  start: Moment;
  end: Moment;
  filters: IncentiveFiltersUxInterface;
  retributions: RetributionUxInterface[];
  max_trips: number;
  max_amount: number;
  only_adult: boolean;
  restrictions: RestrictionUxInterface[];
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
  period: RestrictionPeriodsEnum;
}
