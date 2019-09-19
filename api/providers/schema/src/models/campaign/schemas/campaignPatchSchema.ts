import { weekdayFilterSchema } from './filters/weekdayFilterSchema';
import { timeFilterSchema } from './filters/timeFilterSchema';
import { operatorFilterSchema } from './filters/operatorFilterSchema';
import { distanceFilterSchema } from './filters/distanceFilterSchema';
import { rankFilterSchema } from './filters/rankFilterSchema';
import { inseeFilterSchema } from './filters/inseeFilterSchema';
import { retributionRuleSchema } from './retributionRuleSchema';

export const campaignPatchSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'patch'],
  properties: {
    _id: {
      macro: 'objectid',
    },
    patch: {
      type: 'object',
      minProperties: 1,
      properties: {
        ui_status: {
          type: 'object',
        },
        name: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        start: {
          macro: 'timestamp',
        },
        end: {
          macro: 'timestamp',
        },
        unit: {
          type: 'string',
          enum: ['euro', 'point'],
        },
        filters: {
          type: 'object',
          additionalProperties: false,
          properties: {
            weekday: weekdayFilterSchema,
            time: timeFilterSchema,
            operators_id: operatorFilterSchema,
            distance_range: distanceFilterSchema,
            rank: rankFilterSchema,
            insee: inseeFilterSchema,
          },
        },
        retribution_rules: {
          type: 'array',
          minItems: 1,
          items: retributionRuleSchema,
        },
      },
    },
  },
};
