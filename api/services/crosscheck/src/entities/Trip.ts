// tslint:disable:variable-name
import { PersonInterface, TripInterface } from '@pdc/provider-schema';

export class Trip implements TripInterface {
  public _id?: string;
  public operator_trip_id?: string;
  public operator_id: string[];
  public territories?: string[];
  public status: string;
  public start: Date;
  public people: PersonInterface[];
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date;

  constructor(data: {
    _id?: string;
    operator_trip_id?: string;
    operator_id: string[];
    territories?: string[];
    status: string;
    start: Date;
    people: PersonInterface[];
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }) {
    if ('_id' in data) {
      this._id = data._id;
    }
    this.territories = data.territories;
    this.status = data.status;
    this.start = data.start;
    this.people = data.people;
    this.operator_trip_id = data.operator_trip_id;
    this.operator_id = data.operator_id;
  }
}
