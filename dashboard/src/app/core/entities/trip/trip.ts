import { Person } from '~/core/entities/trip/person';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { TripClassEnum } from '~/core/enums/trip/trip-class.enum';
import { IModel } from '~/core/entities/IModel';
import { CampaignShortInterface } from '~/core/interfaces/trip/tripInterface';

export class Trip implements IModel {
  public _id: string;
  public status: TripStatusEnum;
  public start: Date;
  public people: Person[];
  public class: TripClassEnum;
  public campaigns: any[];

  constructor(obj?: {
    _id: string;
    status: TripStatusEnum;
    start: Date;
    people: Person[];
    class: TripClassEnum;
    campaigns: CampaignShortInterface[];
  }) {
    this.status = obj.status;
    this.start = obj.start;
    this.people = obj.people;
    this.class = obj.class;
    this.campaigns = obj.campaigns;
  }
}
