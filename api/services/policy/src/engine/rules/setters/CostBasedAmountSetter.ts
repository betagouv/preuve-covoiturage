import { RuleHandlerContextInterface } from '../../interfaces';
import { SetterRule } from '../SetterRule';

export class CostBasedAmountSetter extends SetterRule {
  static readonly slug: string = 'cost_based_amount_setter';
  static readonly description: string = 'Montant correspondant au coût du trajet';

  set(ctx: RuleHandlerContextInterface): number {
    return Math.abs(ctx.person.cost); // TODO passenger only ?
  }
}
