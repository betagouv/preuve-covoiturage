import { RuleHandlerContextInterface } from '../../interfaces';
import { ModifierRule } from '../ModifierRule';

interface BoundedModifierParams {
  minimum?: number;
  maximum?: number;
}

export class BoundedModifier extends ModifierRule<BoundedModifierParams> {
  static readonly slug: string = 'bounded';
  static readonly description: string = 'Applique une borne sur le montant';
  static readonly schema: { [k: string]: any } = {
    type: 'object',
    additionalProperties: false,
    properties: {
      minimum: {
        type: 'integer',
        minimum: 0,
      },
      maximum: {
        type: 'integer',
        minimum: 0,
      },
    },
  };

  async modify(_ctx: RuleHandlerContextInterface, result: number): Promise<number> {
    let boundedResult = result;
    if(this.parameters.minimum) {
      boundedResult = Math.max(this.parameters.minimum, boundedResult);
    }
    if(this.parameters.maximum) {
      boundedResult = Math.min(this.parameters.maximum, boundedResult);
    }
    return boundedResult;
  }
}
