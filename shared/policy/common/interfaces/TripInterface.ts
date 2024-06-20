import { PersonInterface } from './PersonInterface';

export class TripInterface extends Array<PersonInterface> {
  get datetime(): Date {
    return this.map((p) => p.datetime).reduce((d, i) => (d < i ? d : i), new Date());
  }
}
