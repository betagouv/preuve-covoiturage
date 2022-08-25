import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { StatelessContextInterface, StatelessRuleHelper } from '../../interfaces';

export const isDriver: StatelessRuleHelper<void> = (ctx: StatelessContextInterface): boolean => {
  if (ctx.carpool.is_driver !== null && !ctx.carpool.is_driver) {
    return false;
  }
  return true;
};

export const isDriverOrThrow: StatelessRuleHelper<void> = (ctx: StatelessContextInterface): boolean => {
  if (!isDriver(ctx)) {
    throw new NotEligibleTargetException();
  }
  return true;
};
