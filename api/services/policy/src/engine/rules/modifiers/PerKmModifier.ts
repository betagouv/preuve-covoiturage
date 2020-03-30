import { RuleHandlerContextInterface } from '../../interfaces';
import { ModifierRule } from '../ModifierRule';

export class PerKmModifier extends ModifierRule {
  static readonly slug: string = 'per_km_modifier';
  static readonly description: string = 'Le montant est multiplié par le nombre de km';

  modify(ctx: RuleHandlerContextInterface, result: number): number {
    return (result * ctx.person.distance) / 1000;
  }
}
