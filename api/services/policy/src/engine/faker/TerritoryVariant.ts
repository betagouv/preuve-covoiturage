import sample from 'lodash/sample';

import { AbstractVariant } from './AbstractVariant';
import { PersonInterface } from '../../shared/policy/common/interfaces/PersonInterface';

type Params = {
  start: number[];
  end: number[];
};

export class TerritoryVariant extends AbstractVariant<Params> {
  readonly startPropertyPath: string = 'start_territory_id';
  readonly endPropertyPath: string = 'end_territory_id';

  constructor(readonly params: Params) {
    super(params);
  }

  public generate(people: PersonInterface[]): PersonInterface[] {
    return people.map((p) => {
      return {
        ...p,
        [this.startPropertyPath]: [sample(this.params.start)],
        [this.endPropertyPath]: [sample(this.params.end)],
      };
    });
  }
}
