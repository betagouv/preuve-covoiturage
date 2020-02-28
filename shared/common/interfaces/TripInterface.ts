import { PersonInterface } from './PersonInterface';

export interface TripInterface {
  _id?: number;
  operator_trip_id?: number;
  operator_id: number[];
  territories?: number[];
  status: string;
  start: Date;
  people: PersonInterface[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
