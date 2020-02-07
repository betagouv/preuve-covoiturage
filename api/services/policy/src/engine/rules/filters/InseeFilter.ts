import { RuleHandlerContextInterface } from '../../interfaces';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { FilterRule } from '../FilterRule';

interface InseeParamsInterface {
  start: string[];
  end: string[];
}

export abstract class InseeFilter extends FilterRule<InseeParamsInterface[]> {
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
            macro: 'insee',
          },
        },
        end: {
          type: 'array',
          items: {
            macro: 'insee',
          },
        },
      },
    },
    minItems: 1,
  };
}

function inList(list: string[], insee: string): boolean {
  return list.indexOf(insee) > -1;
}

export class InseeWhitelistFilter extends InseeFilter {
  static readonly slug: string = 'insee_whitelist_filter';
  static readonly description: string = 'Liste blanche de code insee';

  async filter(ctx: RuleHandlerContextInterface): Promise<void> {
    let whitelisted = false;
    for (const rule of this.parameters) {
      if (
        (!rule.start.length || inList(rule.start, ctx.person.start_insee)) &&
        (!rule.end.length || inList(rule.end, ctx.person.end_insee))
      ) {
        whitelisted = true;
      }
    }

    if (!whitelisted) {
      throw new NotApplicableTargetException(InseeWhitelistFilter.description);
    }
  }
}

export class InseeBlacklistFilter extends InseeFilter {
  static readonly slug: string = 'insee_blacklist_filter';
  static readonly description: string = 'Liste noire de code insee';

  async filter(ctx: RuleHandlerContextInterface): Promise<void> {
    let blacklisted = false;
    for (const rule of this.parameters) {
      if (
        (!rule.start.length || inList(rule.start, ctx.person.start_insee)) &&
        (!rule.end.length || inList(rule.end, ctx.person.end_insee))
      ) {
        blacklisted = true;
      }
    }
    if (blacklisted) {
      throw new NotApplicableTargetException(InseeBlacklistFilter.description);
    }
  }
}
