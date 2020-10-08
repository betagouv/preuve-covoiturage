import { RuleHandlerParamsInterface } from '../../interfaces';
import { TransformerRule } from '../TransformerRule';

interface DistanceBoundingTransformerParams {
  min?: number;
  max?: number;
  offset?: number;
}

export class DistanceBoundingTransformer extends TransformerRule<DistanceBoundingTransformerParams> {
  static readonly slug: string = 'distance_bounding_transformer';
  static readonly description: string = 'Plafonnement à la distance';
  static readonly schema: { [k: string]: any } = {
    type: 'object',
    additionalProperties: false,
    properties: {
      min: {
        type: 'integer',
        minimum: 0,
      },
      max: {
        type: 'integer',
        minimum: 0,
      },
    },
  };

  transform(context: RuleHandlerParamsInterface): RuleHandlerParamsInterface {
    if (this.parameters.min) {
      context.person.distance = Math.max(this.parameters.min, context.person.distance);
    }
    if (this.parameters.max) {
      context.person.distance = Math.min(this.parameters.max, context.person.distance);
    }
    if (this.parameters.offset) {
      context.person.distance += this.parameters.offset;
    }
    return context;
  }
}
