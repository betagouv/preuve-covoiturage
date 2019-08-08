import { Territory } from '~/core/entities/territory/territory';
import { CampaignStatus } from '~/core/entities/campaign/campaign-status';

export class Campaign {
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

  constructor(obj: any) {
    this._id = obj._id;
    this.name = obj.name;
    this.description = obj.description;
    this.territory = obj.territory;
    this.start = obj.start;
    this.end = obj.end;
    this.status = obj.status;
    this.max_trips = obj.max_trips;
    this.max_amount = obj.max_amount;
    this.trips_number = obj.trips_number;
    this.amount_spent = obj.amount_spent;
  }
}
