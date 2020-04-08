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

  setState(result: number, state: number): number {
    return state + result;
  }
}
