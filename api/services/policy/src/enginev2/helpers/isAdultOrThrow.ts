import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { StatelessContextInterface, StatelessRuleHelper } from '../interfaces';

export const isAdultOrThrow: StatelessRuleHelper<void> = (ctx: StatelessContextInterface): boolean => {
  if (ctx.carpool.is_over_18 !== null && !ctx.carpool.is_over_18) {
    throw new NotEligibleTargetException();
  }
  return true;
};
