import { RuleInterface } from '../../interfaces';
import { MetaRule } from '../MetaRule';
import { DistanceRangeFilter } from '../filters/DistanceRangeFilter';
import { DistanceBoundingTransformer } from '../transformers/DistanceBoundingTransformer';

interface ProgressiveDistanceRangeMetaParameters {
  minimum: number;
  maximum: number;
}

export class ProgressiveDistanceRangeMeta extends MetaRule<ProgressiveDistanceRangeMetaParameters> {
  static readonly slug: string = 'progressive_distance_range_meta';
  static readonly description: string = 'Allocation progressive par distance';
  static readonly schema: { [k: string]: any } = {
    type: 'object',
    additionalProperties: false,
    required: ['minimum', 'maximum'],
    properties: {
      minimum: {
        type: 'integer',
        minimum: 0,
        maximum: 500000,
      },
      maximum: {
        type: 'integer',
        minimum: 0,
        maximum: 500000,
      },
    },
  };

  build(): RuleInterface[] {
    return [
      {
        slug: DistanceRangeFilter.slug,
        parameters: {
          min: this.parameters.minimum,
        },
      },
      {
        slug: DistanceBoundingTransformer.slug,
        parameters: {
          offset: -this.parameters.minimum,
          maximum: this.parameters.maximum,
        },
      },
    ];
  }
}
