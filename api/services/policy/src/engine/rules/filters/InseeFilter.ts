import { RuleHandlerContextInterface } from '../../interfaces';
import { FilterRule } from '../FilterRule';

// This rule is deprecated, please migrate to territory filter instead
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

export class InseeWhitelistFilter extends InseeFilter {
  static readonly slug: string = 'insee_whitelist_filter';
  static readonly description: string = 'Liste blanche de codes INSEE';

  filter(ctx: RuleHandlerContextInterface): void {}
}

export class InseeBlacklistFilter extends InseeFilter {
  static readonly slug: string = 'insee_blacklist_filter';
  static readonly description: string = 'Liste noire de codes INSEE';

  filter(ctx: RuleHandlerContextInterface): void {}
}
