import { PersonInterface, TripInterface } from '@pdc/provider-schema';

export class Trip implements TripInterface {
  public _id?: string;
  public territories?: string[];
  public status: string;
  public start: Date;
  public people: PersonInterface[];
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date;

  constructor(data: { _id?: string; territories?: string[]; status: string; start: Date; people: PersonInterface[] }) {
    this._id = data._id;
    this.territories = data.territories;
    this.status = data.status;
    this.start = data.start;
    this.people = data.people;
  }
}
