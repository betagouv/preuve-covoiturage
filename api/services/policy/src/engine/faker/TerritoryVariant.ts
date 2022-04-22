import sample from 'lodash/sample';

import { AbstractVariant } from './AbstractVariant';
import { PersonInterface } from '../../shared/policy/common/interfaces/PersonInterface';
import { TerritoryCodesInterface } from '../../../../../../shared/territory/common/interfaces/TerritoryCodeInterface';

interface Params {
  start: TerritoryCodesInterface[];
  end: TerritoryCodesInterface[];
}
export class TerritoryVariant extends AbstractVariant<Params> {
  readonly startPropertyPath: string = 'start';
  readonly endPropertyPath: string = 'end';

  constructor(readonly params: Params) {
    super(params);
  }

  public generate(people: PersonInterface[]): PersonInterface[] {
    return people.map((p) => {
      return {
        ...p,
        [this.startPropertyPath]: sample(this.params.start),
        [this.endPropertyPath]: sample(this.params.end),
      };
    });
  }
}
