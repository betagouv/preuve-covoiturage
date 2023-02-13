import {
  TerritoryCodeInterface,
  TerritorySelectorsInterface,
} from '../../shared/territory/common/interfaces/TerritoryCodeInterface';

export function isSelected(code: TerritoryCodeInterface, selectors: TerritorySelectorsInterface): boolean {
  for (const key of Object.keys(selectors)) {
    const value = code[key];
    if (selectors[key].indexOf(value) >= 0) {
      return true;
    }
  }
  return false;
}
