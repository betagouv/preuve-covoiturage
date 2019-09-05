import { Territory } from '~/core/entities/territory/territory';
import { CampaignInterface } from '~/core/interfaces/campaign/campaignInterface';
import { IncentiveRules } from '~/core/entities/campaign/incentive-rules';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

export class Campaign {
  public _id: string;
  public name: string;
  public description: string;
  public territory?: Territory;
  public start: Date;
  public end: Date;
  public status: CampaignStatusEnum;
  /* tslint:disable:variable-name */
  public max_trips: number;
  public max_amount: number;
  public amount_unit?: IncentiveUnitEnum;
  public trips_number?: number;
  public amount_spent?: number;
  public rules?: IncentiveRules;
  public parameters?: any;

  constructor(obj: CampaignInterface) {
    this._id = obj._id;
    this.name = obj.name;
    this.description = obj.description;
    this.territory = obj.territory;
    this.start = obj.start;
    this.end = obj.end;
    this.status = obj.status || CampaignStatusEnum.DRAFT;
    this.max_trips = obj.max_trips;
    this.max_amount = obj.max_amount;
    this.trips_number = obj.trips_number;
    this.amount_unit = obj.amount_unit;
    this.amount_spent = obj.amount_spent;
    this.rules = obj.rules;
    this.parameters = obj.parameters;
  }
}
