import { RuleHandlerContextInterface } from '../../interfaces';
import { ModifierRule } from '../ModifierRule';

export class PerPassengerModifier extends ModifierRule {
  static readonly slug: string = 'per_passenger_modifier';
  static readonly description: string = 'Le montant est multiplié par le nombre total de passagers';

  modify(ctx: RuleHandlerContextInterface, result: number): number {
    return result * ctx.trip.people.filter((p) => !p.is_driver).reduce((acc, p) => acc + (p.seats || 1), 0);
  }
}
