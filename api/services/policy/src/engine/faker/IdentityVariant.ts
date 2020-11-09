import * as faker from 'faker/locale/fr';
import sampleSize from 'lodash/sampleSize';

import { AbstractVariant } from './AbstractVariant';
import { PersonInterface } from '../../shared/policy/common/interfaces/PersonInterface';

// Params = [nombre de personne, nombre de personne majeure, nombre de personne ayant un titre de transport];
type Params = [number, number, number];
// Identity = [nom, +18, travel_pass]
type Identity = [String, boolean, boolean];

export class IdentityVariant extends AbstractVariant<Params> {
  readonly identityPropertyPath: string = 'identity_uuid';
  readonly agePropertyPath: string = 'is_over_18';
  readonly transportPropertyPath: string = 'has_travel_pass';

  protected identities: Set<Identity> = new Set();

  constructor(public readonly params: Params = [10, 9, 5]) {
    super(params);
    if (params[0] < 1 || params[1] < 0 || params[2] < 0 || params[1] > params[0] || params[2] > params[0]) {
      throw new Error('Misconfigured variant');
    }

    for (let i = 0; i < this.params[0]; i++) {
      this.identities.add([
        `${faker.name.firstName()} ${faker.name.lastName()}`,
        i < this.params[1],
        i < this.params[2],
      ]);
    }
  }

  public generate(people: PersonInterface[]): PersonInterface[] {
    if (people.length > this.identities.size) {
      throw new Error('Misconfigured variant, add more identities');
    }

    // TODO : add guard to avoid driver to be under 18

    let identities = sampleSize([...this.identities.values()], people.length);
    return people.map((p, i) => {
      return {
        ...p,
        [this.identityPropertyPath]: identities[i][0],
        [this.agePropertyPath]: identities[i][1],
        [this.transportPropertyPath]: identities[i][2],
      };
    });
  }
}
