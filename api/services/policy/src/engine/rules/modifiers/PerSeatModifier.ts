import { RuleHandlerContextInterface } from '../../interfaces';
import { ModifierRule } from '../ModifierRule';

// This rule is deprecated, please migrate to per_passenger_modifier
export class PerSeatModifier extends ModifierRule {
  static readonly slug: string = 'per_seat_modifier';
  static readonly description: string = 'Le montant est multiplié par le nombre de sièges';

  modify(ctx: RuleHandlerContextInterface, result: number): number {
    return result;
  }
}
