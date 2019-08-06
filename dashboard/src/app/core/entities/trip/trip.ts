import { Person } from '~/core/entities/trip/person';
import { TripStatus } from '~/core/entities/trip/trip-status';
import { TripClass } from '~/core/entities/trip/trip-class';
import { IModel } from '~/core/entities/IModel';

export class Trip implements IModel {
  public _id: string;
  public status: TripStatus;
  public start: Date;
  public people: Person[];
  public class: TripClass;
  public campaigns: any[];

  constructor(obj?: {
    _id?: string;
    status: TripStatus;
    start: Date;
    people: Person[];
    class: TripClass;
    campaigns: [];
  }) {
    if ('_id' in obj) {
      this._id = obj._id;
    }
    this.status = obj.status;
    this.start = obj.start;
    this.people = obj.people;
    this.class = obj.class;
    this.campaigns = obj.campaigns;
  }
}
