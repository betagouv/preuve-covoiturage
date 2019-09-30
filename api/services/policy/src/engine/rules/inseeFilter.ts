import { ApplicableRuleInterface } from '../../interfaces/RuleInterfaces';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { HIGH } from '../helpers/priority';

const andOrSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['start', 'end', 'operator'],
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
    operator: {
      type: 'string',
      enum: ['and', 'or'],
    },
  },
};
const blacklistWhitelistSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['and', 'or'],
  properties: {
    and: andOrSchema,
    or: andOrSchema,
  },
};

interface InseeParamsInterface {
  start: string[];
  end: string[];
  operator: 'and' | 'or';
}

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
  apply(params: InseeParamsInterface) {
    return async (ctx, next) => {
      if (
        params.operator === 'and' &&
        (!inList(params.start, ctx.person.start.insee) || !inList(params.end, ctx.person.end.insee))
      ) {
        throw new NotApplicableTargetException(inseeWhitelistFilter);
      }

      if (
        params.operator === 'or' &&
        (!inList(params.start, ctx.person.start.insee) && !inList(params.end, ctx.person.end.insee))
      ) {
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
  apply(params: InseeParamsInterface) {
    return async (ctx, next) => {
      if (
        params.operator === 'and' &&
        (inList(params.start, ctx.person.start.insee) && inList(params.end, ctx.person.end.insee))
      ) {
        throw new NotApplicableTargetException(inseeBlacklistFilter);
      }

      if (
        params.operator === 'or' &&
        (inList(params.start, ctx.person.start.insee) || inList(params.end, ctx.person.end.insee))
      ) {
        throw new NotApplicableTargetException(inseeBlacklistFilter);
      }
      return next();
    };
  },
};
