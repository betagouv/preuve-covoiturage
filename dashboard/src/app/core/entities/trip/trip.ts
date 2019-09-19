import { Person } from '~/core/entities/trip/person';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { IModel } from '~/core/entities/IModel';
import { CampaignShortInterface } from '~/core/interfaces/trip/tripInterface';

export class Trip implements IModel {
  public _id: string;
  public status: TripStatusEnum;
  public start: Date;
  public people: Person[];
  public campaigns: any[];

  constructor(obj?: {
    _id: string;
    status: TripStatusEnum;
    start: Date;
    people: Person[];
    class: TripRankEnum;
    campaigns: CampaignShortInterface[];
  }) {
    this.status = obj.status;
    this.start = obj.start;
    this.people = obj.people;
    this.campaigns = obj.campaigns;
  }
}
