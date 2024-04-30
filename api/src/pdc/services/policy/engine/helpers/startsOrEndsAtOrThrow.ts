import { StatelessContextInterface, StatelessRuleHelper, TerritorySelectorsInterface } from '../../interfaces';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { startsOrEndsAt } from './position';

export const startsOrEndsAtOrThrow: StatelessRuleHelper<TerritorySelectorsInterface> = (
  ctx: StatelessContextInterface,
  selector: TerritorySelectorsInterface,
): boolean => {
  if (!startsOrEndsAt(ctx, selector)) {
    throw new NotEligibleTargetException("Journey doesn't start or end in the territory");
  }
  return true;
};
