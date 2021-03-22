import { AbstractStatefulRestriction } from './AbstractStatefulRestriction';
import { MetaInterface, RuleHandlerContextInterface } from '../../interfaces';

export class MaxTripRestriction extends AbstractStatefulRestriction {
  static readonly slug: string = 'max_trip_restriction';
  static readonly description: string = 'Nombre de trajet maximumm';

  getPrefix(): string {
    return MaxTripRestriction.slug;
  }

  getErrorMessage(): string {
    return MaxTripRestriction.description;
  }

  setState(_result: number, state: number): number {
    return state + 1;
  }

  getStateKey(ctx: RuleHandlerContextInterface, meta: MetaInterface): string | undefined {
    const result = super.getStateKey(ctx, meta);
    if (this.parameters.target !== 'driver' || !ctx.person.is_driver) {
      return result;
    }
    if (meta.get(ctx.person.identity_uuid) >= 1) {
      return;
    }
    meta.set(ctx.person.identity_uuid, 1);
    return result;
  }
}
