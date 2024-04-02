import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { StatelessContextInterface, StatelessRuleHelper } from '../../interfaces';

export const isAdultOrThrow: StatelessRuleHelper<void> = (ctx: StatelessContextInterface): boolean => {
  if (ctx.carpool.passenger_is_over_18 !== null && !ctx.carpool.passenger_is_over_18) {
    throw new NotEligibleTargetException('Passenger is not an adult');
  }
  return true;
};
