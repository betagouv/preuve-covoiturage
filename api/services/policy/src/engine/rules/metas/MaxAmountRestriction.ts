import { RuleInterface } from '../../interfaces';
import { MetaRule } from '../MetaRule';
import { MetaMaximumFilter } from '../filters/MetaMaximumFilter';
import { MetaAmountPost } from '../posts/MetaAmountPost';

interface MaxAmountParameters {
  amount: number;
  period: string;
}
export class MaxAmountRestriction extends MetaRule<MaxAmountParameters> {
  static readonly slug: string = 'max_amount_restriction';
  static readonly description: string = 'Montant maximum';
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
          prefix: MaxAmountRestriction.slug,
        },
      },
      {
        slug: MetaAmountPost.slug,
        parameters: {
          period: this.parameters.period,
          prefix: MaxAmountRestriction.slug,
        },
      },
    ];
  }
}
