import { utcToZonedTime } from '../../helpers/utcToZonedTime';
import { RuleHandlerContextInterface } from '../../interfaces';
import { ModifierRule } from '../ModifierRule';

interface PerDateModifierInterface {
  dates: string[];
  coef: number;
  tz?: string;
}

export class PerDateModifier extends ModifierRule<PerDateModifierInterface> {
  static readonly slug: string = 'per_date_modifier';
  static readonly description: string = 'Le montant est multiplié par un coefficient si le trajet est sur une date';
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

  modify(ctx: RuleHandlerContextInterface, result: number): number {
    const dateStr = utcToZonedTime(ctx.person.datetime, this.parameters.tz).toISOString();
    const ctxDate = dateStr.split('T')[0];
    if (this.parameters.dates.indexOf(ctxDate) >= 0) {
      return result * this.parameters.coef;
    }
    return result;
  }
}
