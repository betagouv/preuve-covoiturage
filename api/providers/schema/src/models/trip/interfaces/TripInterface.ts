import { PersonInterface } from '../../person';

export interface TripInterface {
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
}
