import { PersonInterface } from '../../person';

export interface TripInterface {
  _id?: string;
  territories?: string[];
  status: string;
  start: Date;
  people: PersonInterface[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
