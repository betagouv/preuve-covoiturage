import { PersonInterface } from './PersonInterface';

export interface TripInterface {
  trip_id: number;
  datetime: Date;
  people: PersonInterface[];
}
