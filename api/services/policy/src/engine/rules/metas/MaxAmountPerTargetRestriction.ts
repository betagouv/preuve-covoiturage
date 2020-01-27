import { RuleInterface } from '../../interfaces';
import { MetaRule } from '../MetaRule';
import { MetaMaximumFilter } from '../filters/MetaMaximumFilter';
import { MetaAmountPost } from '../posts/MetaAmountPost';

interface MaxAmountParameters {
  target: string;
  amount: number;
  period: string;
}
export class MaxAmountPerTargetRestriction extends MetaRule<MaxAmountParameters> {
  static readonly slug: string = 'max_amount_per_target_restriction';
  static readonly description: string = 'Montant maximum par personne';
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
          prefix: MaxAmountPerTargetRestriction.slug,
        },
      },
      {
        slug: MetaAmountPost.slug,
        parameters: {
          prefix: MaxAmountPerTargetRestriction.slug,
          target: this.parameters.target,
          period: this.parameters.period,
        },
      },
    ];
  }
}
