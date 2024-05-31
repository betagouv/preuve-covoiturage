import { StatelessContextInterface, StatelessRuleHelper, TerritorySelectorsInterface } from '../../interfaces/index.ts';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException.ts';
import { startsOrEndsAt } from './position.ts';

export const startsOrEndsAtOrThrow: StatelessRuleHelper<TerritorySelectorsInterface> = (
  ctx: StatelessContextInterface,
  selector: TerritorySelectorsInterface,
): boolean => {
  if (!startsOrEndsAt(ctx, selector)) {
    throw new NotEligibleTargetException("Journey doesn't start or end in the territory");
  }
  return true;
};
