import { AbstractStatefulRestriction } from './AbstractStatefulRestriction';

export class MaxTripRestriction extends AbstractStatefulRestriction {
  static readonly slug: string = 'max_trip_restriction';
  static readonly description: string = 'Nombre de trajet maximumm';
  
  getPrefix() {
    return MaxTripRestriction.slug;
  }

  getErrorMessage() {
    return MaxTripRestriction.description;
  }

  setState(_result: number, state: number): number {
    return state + 1;
  }
}
