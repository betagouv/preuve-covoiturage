import { Territory } from '~/core/entities/territory/territory';
import { CampaignStatus } from '~/core/entities/campaign/campaign-status';

export interface CampaignInterface {
  _id: string;
  name: string;
  description: string;
  territory?: Territory;
  start: Date;
  end: Date;
  status: CampaignStatus;
  /* tslint:disable:variable-name */
  max_trips: number;
  max_amount: number;
  trips_number?: number;
  amount_spent?: number;
}
