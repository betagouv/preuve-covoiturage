import { StatelessContextInterface, StatelessRuleHelper, TerritorySelectorsInterface } from '../../interfaces';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { startsAndEndsAt } from './position';

export const startAndEndAtOrThrow: StatelessRuleHelper<TerritorySelectorsInterface> = (
  ctx: StatelessContextInterface,
  selector: TerritorySelectorsInterface,
): boolean => {
  if (!startsAndEndsAt(ctx, selector)) {
    throw new NotEligibleTargetException('Journey start & end not in region');
  }
  return true;
};
