import { ApplicableRuleInterface } from '../../interfaces/RuleInterface';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { HIGH } from '../helpers/priority';

const andOrSchema = {
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
};

const blacklistWhitelistSchema = {
  type: 'array',
  items: andOrSchema,
  minItems: 1,
};

interface InseeParamsInterface {
  start: string[];
  end: string[];
  operator: 'and' | 'or';
}

type InseeParamsType = InseeParamsInterface[];

function inList(list: string[], insee: string): boolean {
  return list.indexOf(insee) > -1;
}

export const inseeWhitelistFilter: ApplicableRuleInterface = {
  slug: 'insee_whitelist_filter',
  description: 'Liste blanche de code insee',
  schema: {
    ...blacklistWhitelistSchema,
  },
  index: HIGH,
  apply(params: InseeParamsType) {
    return async (ctx, next) => {
      let whitelisted = false;
      for (const rule of params) {
        if (
          (!rule.start.length || inList(rule.start, ctx.person.start_insee)) &&
          (!rule.end.length || inList(rule.end, ctx.person.end_insee))
        ) {
          whitelisted = true;
        }
      }

      if (!whitelisted) {
        throw new NotApplicableTargetException(inseeWhitelistFilter);
      }

      return next();
    };
  },
};

export const inseeBlacklistFilter: ApplicableRuleInterface = {
  slug: 'insee_blacklist_filter',
  description: 'Liste noire de code insee',
  schema: {
    ...blacklistWhitelistSchema,
  },
  index: HIGH,
  apply(params: InseeParamsType) {
    return async (ctx, next) => {
      let blacklisted = false;
      for (const rule of params) {
        if (
          (!rule.start.length || inList(rule.start, ctx.person.start_insee)) &&
          (!rule.end.length || inList(rule.end, ctx.person.end_insee))
        ) {
          blacklisted = true;
        }
      }

      if (blacklisted) {
        throw new NotApplicableTargetException(inseeBlacklistFilter);
      }

      return next();
    };
  },
};
