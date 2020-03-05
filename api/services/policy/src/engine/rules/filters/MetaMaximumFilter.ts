import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { FilterRule } from '../FilterRule';
import { RuleHandlerContextInterface } from '../../interfaces';
import { getMetaKey, period } from '../../helpers/getMetaKey';

interface MetaMaxParameters {
  target?: 'driver' | 'passenger';
  amount: number;
  period: period;
  prefix: string;
}
export class MetaMaximumFilter extends FilterRule<MetaMaxParameters> {
  static readonly slug: string = 'meta_maximum_filter';
  static readonly description: string = 'Filtre par maximum via les méta-données';
  static readonly schema: { [k: string]: any } = {
    type: 'object',
    required: ['amount', 'period', 'prefix'],
    additionalProperties: false,
    properties: {
      prefix: {
        type: 'string',
        pattern: '^[A-Za-z]*$',
        maxLength: 128,
      },
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
        enum: ['day', 'month', 'campaign'],
      },
    },
  };

  async filter(ctx: RuleHandlerContextInterface): Promise<void> {
    if (
      this.parameters.target &&
      ((this.parameters.target === 'driver' && !ctx.person.is_driver) ||
        (this.parameters.target === 'passenger' && ctx.person.is_driver))
    ) {
      return;
    }

    const key = getMetaKey(
      this.parameters.prefix,
      ctx.person.datetime,
      this.parameters.period,
      this.parameters.target ? ctx.person.identity_uuid : 'global',
    );
    const periodConsuption = ctx.meta.get(key, 0);
    // test if consuption > limit
    if (periodConsuption >= this.parameters.amount) {
      throw new NotApplicableTargetException(`${MetaMaximumFilter.description} : ${this.parameters.prefix}`);
    }
  }
}
