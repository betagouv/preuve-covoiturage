import { PersonInterface } from '../../shared/policy/common/interfaces/PersonInterface';

export class AbstractVariant<P> {
  constructor(params: P) {}

  public generate(people: PersonInterface[]): PersonInterface[] {
    return people;
  }
}
