import { RuleInterface } from '../../interfaces';
import { MetaRule } from '../MetaRule';
import { DateFilter } from '../filters/DateFilter';
import { FixedModifier } from '../modifiers/FixedModifier';

interface DateModifierMetaParameters {
  dates: string[];
  coef: number;
  tz?: string;
}
export class DateModifierMeta extends MetaRule<DateModifierMetaParameters> {
  static readonly slug: string = 'date_modifier_meta';
  static readonly description: string = 'Applique un modificateur si le trajet est sur la date';
  static readonly schema: { [k: string]: any } = {
    type: 'object',
    required: ['dates', 'coef'],
    properties: {
      dates: {
        type: 'array',
        items: {
          type: 'string',
          format: 'date',
          maxLength: 100,
        },
      },
      coef: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        multipleOf: 0.01,
      },
      tz: {
        macro: 'tz',
      },
    },
  };

  build(): RuleInterface[] {
    return [
      {
        slug: DateFilter.slug,
        parameters: {
          whitelist: this.parameters.dates,
          tz: this.parameters.tz,
        },
      },
      {
        slug: FixedModifier.slug,
        parameters: this.parameters.coef,
      },
    ];
  }
}
