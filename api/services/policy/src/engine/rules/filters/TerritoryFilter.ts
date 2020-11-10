import { RuleHandlerContextInterface } from '../../interfaces';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { FilterRule } from '../FilterRule';

interface TerritoryParamsInterface {
  start: number[];
  end: number[];
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
          type: 'array',
          items: {
            macro: 'serial',
          },
        },
        end: {
          type: 'array',
          items: {
            macro: 'serial',
          },
        },
      },
    },
    minItems: 1,
  };
}

function inList(list: number[], territories: number[]): boolean {
  for (const territory of territories) {
    if (list.indexOf(territory) > -1) {
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
      if (
        (!rule.start.length || inList(rule.start, ctx.person.start_territory_id)) &&
        (!rule.end.length || inList(rule.end, ctx.person.end_territory_id))
      ) {
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
      if (
        (!rule.start.length || inList(rule.start, ctx.person.start_territory_id)) &&
        (!rule.end.length || inList(rule.end, ctx.person.end_territory_id))
      ) {
        blacklisted = true;
      }
    }
    if (blacklisted) {
      throw new NotApplicableTargetException(TerritoryBlacklistFilter.description);
    }
  }
}
