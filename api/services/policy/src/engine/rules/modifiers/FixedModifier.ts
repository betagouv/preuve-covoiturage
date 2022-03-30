import { RuleHandlerContextInterface } from '../../interfaces';
import { ModifierRule } from '../ModifierRule';

export class FixedModifier extends ModifierRule<number> {
  static readonly slug: string = 'Fixed_modifier';
  static readonly description: string = 'Le montant est multiplié par un coefficient';
  static readonly schema: { [k: string]: any } = {
    type: 'integer',
    minimum: 0,
  };

  modify(_ctx: RuleHandlerContextInterface, result: number): number {
    return result * this.parameters;
  }
}
