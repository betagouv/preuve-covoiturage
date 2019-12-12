import { PersonInterface } from './PersonInterface';

export interface TripInterface {
  territories: number[];
  datetime: Date;
  people: PersonInterface[];
}
