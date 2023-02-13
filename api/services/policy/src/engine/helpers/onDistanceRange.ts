import { StatelessContextInterface, StatelessRuleHelper } from '../../shared/policy/common/interfaces/PolicyInterface';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';

interface OnDistanceParams {
  min?: number;
  max?: number;
}

export const onDistanceRange: StatelessRuleHelper<OnDistanceParams> = (
  ctx: StatelessContextInterface,
  params: OnDistanceParams,
): boolean => {
  if ('min' in params && params.min !== null && ctx.carpool.distance < params.min) {
    return false;
  }
  if (params.max && ctx.carpool.distance >= params.max) {
    return false;
  }
  return true;
};

export const onDistanceRangeOrThrow: StatelessRuleHelper<OnDistanceParams> = (
  ctx: StatelessContextInterface,
  params: OnDistanceParams,
): boolean => {
  if (!onDistanceRange(ctx, params)) {
    throw new NotEligibleTargetException();
  }
  return true;
};
