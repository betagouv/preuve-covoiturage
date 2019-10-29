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
  public created_at?: Date;
  public updated_at?: Date;
  public deleted_at?: Date;

  constructor(data: {
    _id?: string;
    operator_trip_id?: string;
    operator_id: string[];
    territories?: string[];
    status: string;
    start: Date;
    people: PersonInterface[];
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
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
