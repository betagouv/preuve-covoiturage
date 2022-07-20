import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { StatelessContextInterface, StatelessRuleHelper } from '../interfaces';

interface OnDistanceParams {
  min?: number;
  max?: number;
}

export const onDistanceRange: StatelessRuleHelper<OnDistanceParams> = (
  ctx: StatelessContextInterface,
  params: OnDistanceParams,
): boolean => {
  if (params.min && ctx.carpool.distance < params.min) {
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
