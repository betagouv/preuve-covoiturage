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

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this.status = (obj && obj.status) || null;
    this.start = (obj && obj.start) || null;
    this.people = (obj && obj.people) || null;
    this.class = (obj && obj.class) || null;
  }
}
