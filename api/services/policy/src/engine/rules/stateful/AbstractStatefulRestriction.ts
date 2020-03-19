import { AbstractStatefulRule } from '../AbstractStatefulRule';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { getMetaKey } from '../../helpers/getMetaKey';
import { MetaInterface, RuleHandlerContextInterface } from '../../interfaces';

export interface StatefulRestrictionParameters {
  target?: 'driver' | 'passenger';
  amount: number;
  period: 'day' | 'month' | 'campaign';
  uuid: string;
}
export abstract class AbstractStatefulRestriction extends AbstractStatefulRule<StatefulRestrictionParameters> {
  static readonly schema: { [k: string]: any } = {
    type: 'object',
    required: ['amount', 'period', 'uuid'],
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
        enum: ['day', 'month', 'campaign'],
      },
      uuid: {
        type: 'string',
      },
    },
  };

  abstract getPrefix():string;
  abstract getErrorMessage():string;

  getState(ctx: RuleHandlerContextInterface, meta: MetaInterface): number {
    if (
      this.parameters.target &&
        ((this.parameters.target === 'driver' && !ctx.person.is_driver) ||
          (this.parameters.target === 'passenger' && ctx.person.is_driver))
    ) {
      return 0;
    }

    const key = getMetaKey(
      this.getPrefix(),
      ctx.person.datetime,
      this.parameters.period,
      this.parameters.target ? ctx.person.identity_uuid : 'global',
    );
    return meta.get(key, 0);
  }

  apply(result: number, state: number): number {
    // test if consuption > limit
    if (state >= this.parameters.amount) {
      throw new NotApplicableTargetException(this.getErrorMessage());
    }
    return result;
  }

  abstract setState(result: number, state: number): number;
}
