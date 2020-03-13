import { RuleInterface } from '../../interfaces';
import { MetaRule } from '../MetaRule';
import { MetaMaximumFilter } from '../filters/MetaMaximumFilter';
import { MetaTripPost } from '../stateful/MetaTripPost';

interface MaxTripParameters {
  target: 'driver' | 'passenger';
  amount: number;
  period: string;
}

export class MaxTripPerTargetRestriction extends MetaRule<MaxTripParameters> {
  static readonly slug: string = 'max_trip_per_target_restriction';
  static readonly description: string = 'Nombre de trajet maximum par personne';
  static readonly schema: { [k: string]: any } = {
    type: 'object',
    required: ['target', 'amount', 'period'],
    additionalProperties: false,
    properties: {
      target: {
        type: 'string',
        enum: ['driver', 'passenger'],
      },
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
          prefix: MaxTripPerTargetRestriction.slug,
        },
      },
      {
        slug: MetaTripPost.slug,
        parameters: {
          prefix: MaxTripPerTargetRestriction.slug,
          target: this.parameters.target,
          period: this.parameters.period,
        },
      },
    ];
  }
}
