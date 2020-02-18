import { RuleInterface } from '../../interfaces';
import { MetaRule } from '../MetaRule';
import { DistanceRangeFilter } from '../filters/DistanceRangeFilter';
import { DistanceBoundingTransformer } from '../transformers/DistanceBoundingTransformer';

interface ProgressiveDistanceRangeMetaParameters {
  min: number;
  max: number;
}

export class ProgressiveDistanceRangeMeta extends MetaRule<ProgressiveDistanceRangeMetaParameters> {
  static readonly slug: string = 'progressive_distance_range_meta';
  static readonly description: string = 'Allocation progressive par distance';
  static readonly schema: { [k: string]: any } = {
    type: 'object',
    additionalProperties: false,
    required: ['min', 'max'],
    properties: {
      min: {
        type: 'integer',
        min: 0,
        max: 500000,
      },
      max: {
        type: 'integer',
        min: 0,
        max: 500000,
      },
    },
  };

  build(): RuleInterface[] {
    return [
      {
        slug: DistanceRangeFilter.slug,
        parameters: {
          min: this.parameters.min,
        },
      },
      {
        slug: DistanceBoundingTransformer.slug,
        parameters: {
          offset: -this.parameters.min,
          max: this.parameters.max,
        },
      },
    ];
  }
}
