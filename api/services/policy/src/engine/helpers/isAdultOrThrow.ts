import { StatelessContextInterface, StatelessRuleHelper } from '../../shared/policy/common/interfaces/PolicyInterface';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';

export const isAdultOrThrow: StatelessRuleHelper<void> = (ctx: StatelessContextInterface): boolean => {
  if (ctx.carpool.passenger_is_over_18 !== null && !ctx.carpool.passenger_is_over_18) {
    throw new NotEligibleTargetException();
  }
  return true;
};
