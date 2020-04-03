import { RuleHandlerContextInterface } from '../../interfaces';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { FilterRule } from '../FilterRule';

interface Parameters {
  min?: number;
  max?: number;
}

export class DistanceRangeFilter extends FilterRule<Parameters> {
  static readonly slug: string = 'distance_range_filter';
  static readonly description: string = 'Filtre par distance';
  static readonly schema: { [k: string]: any } = {
    type: 'object',
    additionalProperties: false,
    properties: {
      min: {
        type: 'integer',
        minimum: 0,
        maximum: 100000,
      },
      max: {
        type: 'integer',
        minimum: 0,
        maximum: 500000,
      },
    },
  };

  filter(ctx: RuleHandlerContextInterface): void {
    if (
      (this.parameters.min && ctx.person.distance < this.parameters.min) ||
      (this.parameters.max && ctx.person.distance > this.parameters.max)
    ) {
      throw new NotApplicableTargetException(DistanceRangeFilter.description);
    }
  }
}
