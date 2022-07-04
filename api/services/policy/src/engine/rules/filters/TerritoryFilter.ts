import { RuleHandlerContextInterface } from '../../interfaces';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { FilterRule } from '../FilterRule';
import {
  TerritoryCodeInterface,
  TerritorySelectorsInterface,
} from '../../../shared/territory/common/interfaces/TerritoryCodeInterface';

export interface TerritoryParamsInterface {
  start: TerritorySelectorsInterface;
  end: TerritorySelectorsInterface;
}

export abstract class TerritoryFilter extends FilterRule<TerritoryParamsInterface[]> {
  static readonly schema: { [k: string]: any } = {
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: false,
      required: ['start', 'end'],
      properties: {
        start: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: {
              macro: 'serial',
            },
          },
          propertyNames: {
            enum: ['com', 'arr', 'aom', 'epci'],
          },
        },
        end: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: {
              macro: 'serial',
            },
          },
          propertyNames: {
            enum: ['com', 'arr', 'aom', 'epci'],
          },
        },
      },
    },
    minItems: 1,
  };
}

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

export class TerritoryWhitelistFilter extends TerritoryFilter {
  static readonly slug: string = 'territory_whitelist_filter';
  static readonly description: string = 'Liste blanche de codes territoire';

  filter(ctx: RuleHandlerContextInterface): void {
    let whitelisted = false;
    for (const rule of this.parameters) {
      if (inList(rule.start, ctx.person.start) && inList(rule.end, ctx.person.end)) {
        whitelisted = true;
      }
    }

    if (!whitelisted) {
      throw new NotApplicableTargetException(TerritoryWhitelistFilter.description);
    }
  }
}

export class TerritoryBlacklistFilter extends TerritoryFilter {
  static readonly slug: string = 'territory_blacklist_filter';
  static readonly description: string = 'Liste noire de codes territoire';

  filter(ctx: RuleHandlerContextInterface): void {
    let blacklisted = false;
    for (const rule of this.parameters) {
      if (inList(rule.start, ctx.person.start) && inList(rule.end, ctx.person.end)) {
        blacklisted = true;
      }
    }
    if (blacklisted) {
      throw new NotApplicableTargetException(TerritoryBlacklistFilter.description);
    }
  }
}
