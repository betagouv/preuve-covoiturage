import {
  TerritoryCodeInterface,
  TerritorySelectorsInterface,
} from '../../shared/territory/common/interfaces/TerritoryCodeInterface';
import { StatelessContextInterface, StatelessRuleHelper } from '../interfaces';

function inList(selectors: TerritorySelectorsInterface, territory: TerritoryCodeInterface): boolean {
  if (!selectors || Object.keys(selectors).length === 0) {
    return true;
  }
  for (const selector of Object.keys(selectors)) {
    const list = selectors[selector] || [];
    const territoryCode = territory[selector] || [];
    if (list.indexOf(territoryCode) > -1) {
      return true;
    }
  }
  return false;
}

export const startsAt: StatelessRuleHelper<TerritorySelectorsInterface> = (
  ctx: StatelessContextInterface,
  selector: TerritorySelectorsInterface,
): boolean => {
  if (!inList(selector, ctx.carpool.start)) {
    return false;
  }
  return true;
};

export const endsAt: StatelessRuleHelper<TerritorySelectorsInterface> = (
  ctx: StatelessContextInterface,
  selector: TerritorySelectorsInterface,
): boolean => {
  if (!inList(selector, ctx.carpool.end)) {
    return false;
  }
  return true;
};
