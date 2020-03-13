import { RuleHandlerParamsInterface } from '../../interfaces';
import { TransformerRule } from '../TransformerRule';

interface DistanceBoundingTransformerParams {
  minimum?: number;
  maximum?: number;
  offset?: number;
}

export class DistanceBoundingTransformer extends TransformerRule<DistanceBoundingTransformerParams> {
  static readonly slug: string = 'distance_bounding_transformer';
  static readonly description: string = 'Plafonnement à la distance';
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

  transform(context: RuleHandlerParamsInterface): RuleHandlerParamsInterface {
    if (this.parameters.minimum) {
      context.person.distance = Math.max(this.parameters.minimum, context.person.distance);
    }
    if (this.parameters.maximum) {
      context.person.distance = Math.min(this.parameters.maximum, context.person.distance);
    }
    if (this.parameters.offset) {
      context.person.distance += this.parameters.offset;
    }
    return context;
  }
}
