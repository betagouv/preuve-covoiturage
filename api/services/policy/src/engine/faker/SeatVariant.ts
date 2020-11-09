import random from 'lodash/random';

import { AbstractVariant } from './AbstractVariant';
import { PersonInterface } from '../../shared/policy/common/interfaces/PersonInterface';

export class SeatVariant extends AbstractVariant<void> {
  readonly propertyPath: string = 'seats';

  public generate(people: PersonInterface[]): PersonInterface[] {
    let maxSeats = 9 - people.length;

    return people.map((p) => {
      let seats = p.is_driver ? 0 : random(1, maxSeats);
      maxSeats -= seats - 1;
      return {
        ...p,
        [this.propertyPath]: seats,
      };
    });
  }
}
