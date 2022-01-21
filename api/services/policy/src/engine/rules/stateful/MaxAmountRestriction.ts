import { AbstractStatefulRestriction } from './AbstractStatefulRestriction';

export class MaxAmountRestriction extends AbstractStatefulRestriction {
  static readonly slug: string = 'max_amount_restriction';
  static readonly description: string = 'Montant maximum';

  getPrefix(): string {
    return MaxAmountRestriction.slug;
  }

  getErrorMessage(): string {
    return MaxAmountRestriction.description;
  }

  getNewState(result: number, state: number): number {
    return state + result;
  }

  apply(result: number, state: number): number {
    super.apply(result, state);

    // if consuption + current > limit, get diff
    if (state + result > this.parameters.amount) {
      return this.parameters.amount - state;
    }
    return result;
  }
}
