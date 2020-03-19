import { ResultInterface } from '../../interfaces';
import { AbstractStatefulRestriction } from './AbstractStatefulRestriction';

export class MaxAmountRestriction extends AbstractStatefulRestriction {
  static readonly slug: string = 'max_amount_restriction';
  static readonly description: string = 'Montant maximum';
  
  getPrefix() {
    return MaxAmountRestriction.slug;
  }

  getErrorMessage() {
    return MaxAmountRestriction.description;
  }

  setState(result: ResultInterface, state: number): number {
    return state + result.amount;
  }
}
