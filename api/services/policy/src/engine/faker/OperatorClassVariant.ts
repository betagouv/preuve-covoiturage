import sample from 'lodash/sample';

import { AbstractVariant } from './AbstractVariant';
import { PersonInterface } from '../../shared/policy/common/interfaces/PersonInterface';

type Params = string[];

export class OperatorClassVariant extends AbstractVariant<Params> {
  readonly propertyPath: string = 'operator_class';

  constructor(public readonly params: Params = ['A', 'B', 'B', 'C', 'C', 'C', 'C']) {
    super(params);
    if (params.filter((p) => ['A', 'B', 'C'].indexOf(p) < 0).length > 0) {
      throw new Error('Misconfigured variant');
    }
  }

  public generate(people: PersonInterface[]): PersonInterface[] {
    return people.map((p) => {
      return {
        ...p,
        [this.propertyPath]: sample(this.params),
      };
    });
  }
}
