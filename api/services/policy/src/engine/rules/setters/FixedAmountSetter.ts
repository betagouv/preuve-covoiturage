import { RuleHandlerContextInterface } from '../../interfaces';
import { SetterRule } from '../SetterRule';

export class FixedAmountSetter extends SetterRule<number> {
  static readonly slug: string = 'fixed_amount_setter';
  static readonly description: string = 'Montant fixe';
  static readonly schema: { [k: string]: any } = {
    type: 'integer',
    minimum: 0,
  };

  set(ctx: RuleHandlerContextInterface): number {
    return this.parameters;
  }
}
