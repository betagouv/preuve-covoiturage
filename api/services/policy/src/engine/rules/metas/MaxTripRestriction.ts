import { RuleInterface } from '../../interfaces';
import { MetaRule } from '../MetaRule';
import { MetaMaximumFilter } from '../filters/MetaMaximumFilter';
import { MetaTripPost } from '../posts/MetaTripPost';

interface MaxTripParameters {
  amount: number;
  period: string;
}

export class MaxTripRestriction extends MetaRule<MaxTripParameters> {
  static readonly slug: string = 'max_trip_restriction';
  static readonly description: string = 'Nombre de trajet maximum';
  static readonly schema: { [k: string]: any } = {
    type: 'object',
    required: ['amount', 'period'],
    additionalProperties: false,
    properties: {
      amount: {
        type: 'integer',
        minimum: 0,
      },
      period: {
        type: 'string',
        enum: ['day', 'month', 'year', 'campaign'],
      },
    },
  };

  build(): RuleInterface[] {
    return [
      {
        slug: MetaMaximumFilter.slug,
        parameters: {
          ...this.parameters,
          prefix: MaxTripRestriction.slug,
        },
      },
      {
        slug: MetaTripPost.slug,
        parameters: {
          prefix: MaxTripRestriction.slug,
          period: this.parameters.period,
        },
      },
    ];
  }
}
