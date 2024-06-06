import { InvalidParamsException } from '/ilos/common/index.ts';
import { StatelessContextInterface, StatelessRuleHelper } from '../../interfaces/index.ts';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException.ts';

interface OnDistanceParams {
  min?: number;
  max?: number;
}

export const onDistanceRange: StatelessRuleHelper<OnDistanceParams> = (
  ctx: StatelessContextInterface,
  params: OnDistanceParams,
): boolean => {
  if (ctx?.carpool?.distance === null || typeof ctx?.carpool?.distance === 'undefined') {
    throw new InvalidParamsException('[onDistanceRange] distance is missing from carpool');
  }

  if (params?.min !== null && typeof params?.min !== 'undefined' && ctx.carpool.distance < params.min) {
    return false;
  }

  if (params?.max !== null && typeof params?.max !== 'undefined' && ctx.carpool.distance >= params.max) {
    return false;
  }

  return true;
};

export const onDistanceRangeOrThrow: StatelessRuleHelper<OnDistanceParams> = (
  ctx: StatelessContextInterface,
  params: OnDistanceParams,
): boolean => {
  if (!onDistanceRange(ctx, params)) {
    throw new NotEligibleTargetException(`Distance out of range: ${ctx?.carpool?.distance} meters`);
  }
  return true;
};
