import { AbstractStatefulRule } from '../AbstractStatefulRule';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { RuleHandlerContextInterface } from '../../interfaces';
import { MetadataWrapperInterface } from '../../../interfaces';

export interface MaxPassengerRestrictionParameters {
  target: 'driver' | 'passenger';
  amount: number;
  uuid: string;
}

export class MaxPassengerRestriction extends AbstractStatefulRule<MaxPassengerRestrictionParameters> {
  static readonly slug: string = 'max_passenger_restriction';
  static readonly description: string = 'Nombre de passager maximum par voiture';
  static readonly schema: { [k: string]: any } = {
    type: 'object',
    required: ['target', 'amount', 'uuid'],
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
      uuid: {
        type: 'string',
      },
    },
  };

  initState(ctx: RuleHandlerContextInterface, meta: MetadataWrapperInterface): void {
    if (
      (this.parameters.target === 'driver' && !ctx.person.is_driver) ||
      (this.parameters.target === 'passenger' && ctx.person.is_driver)
    ) {
      return;
    }
    const key = `${this.getPrefix()}.${this.parameters.target}.${ctx.person.trip_id}`;
    meta.register(this.uuid, key);
    meta.set(key, meta.get(key) || 0);
    meta.extraRegister({ passengers: ctx.trip.filter((p) => !p.is_driver).reduce((acc, p) => acc + (p.seats || 1), 0) });
  }

  apply(result: number, state: number, meta: MetadataWrapperInterface): number {
    // test if consuption > limit
    if (state >= this.parameters.amount) {
      throw new NotApplicableTargetException(this.getErrorMessage());
    }
    // test if next consuption will be > limit
    const next = meta.extraGet('passengers') || 0;
    const diff = this.parameters.amount - (state + next)
    if (diff < 0 && next > 0) {
      return result / next * (next + diff);
    }
  
    return result;
  }

  getPrefix(): string {
    return MaxPassengerRestriction.slug;
  }

  getErrorMessage(): string {
    return MaxPassengerRestriction.description;
  }

  getNewState(_result: number, state: number, meta: MetadataWrapperInterface): number {
    return state + meta.extraGet('passengers') || 0;
  }
}
