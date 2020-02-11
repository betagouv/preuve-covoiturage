import { PostRule } from '../PostRule';
import { RuleHandlerParamsInterface } from '../../interfaces';
import { getMetaKey, period } from '../../helpers/getMetaKey';

interface MetaAmountPostParameters {
  target?: 'driver' | 'passenger';
  period: period;
  prefix: string;
}

export class MetaAmountPost extends PostRule<MetaAmountPostParameters> {
  static readonly slug: string = 'meta_amount_post';
  static readonly description: string = "Incrémente le montant de l'incitation";
  static readonly schema: { [k: string]: any } = {
    type: 'object',
    required: ['prefix', 'period'],
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
      period: {
        type: 'string',
        enum: ['day', 'month', 'campaign'],
      },
    },
  };

  async apply(ctx: RuleHandlerParamsInterface): Promise<void> {
    if (
      (this.parameters.target &&
        ((this.parameters.target === 'driver' && !ctx.person.is_driver) ||
          (this.parameters.target === 'passenger' && ctx.person.is_driver))) ||
      !ctx.result
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
    ctx.meta.set(key, periodConsuption + ctx.result);
  }
}
