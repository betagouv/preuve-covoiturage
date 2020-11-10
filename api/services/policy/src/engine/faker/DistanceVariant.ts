import random from 'lodash/random';

import { AbstractVariant } from './AbstractVariant';
import { PersonInterface } from '../../shared/policy/common/interfaces/PersonInterface';

export class DistanceVariant extends AbstractVariant<[number, number]> {
  readonly propertyPath: string = 'distance';
  readonly costPropertyPath: string = 'cost';

  constructor(protected readonly params: [number, number] = [0, 100]) {
    super(params);
    const [min, max] = params;
    if (min >= max || min <= 0 || max >= 150) {
      throw new Error('Misconfigured variant');
    }
  }

  public generate(people: PersonInterface[]): PersonInterface[] {
    const maxDistance = random(this.params[0], this.params[1]);

    return people.map((p) => {
      const distance = p.is_driver ? maxDistance * 1000 : random(this.params[0], maxDistance) * 1000;
      return {
        ...p,
        [this.propertyPath]: distance,
        [this.costPropertyPath]: p.is_driver ? -(distance / 1000) * 10 : (distance / 1000) * 10,
      };
    });
  }
}
