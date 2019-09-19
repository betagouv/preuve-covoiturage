import { weekdayFilterSchema } from './filters/weekdayFilterSchema';
import { timeFilterSchema } from './filters/timeFilterSchema';
import { operatorFilterSchema } from './filters/operatorFilterSchema';
import { distanceFilterSchema } from './filters/distanceFilterSchema';
import { rankFilterSchema } from './filters/rankFilterSchema';
import { inseeFilterSchema } from './filters/inseeFilterSchema';
import { retributionRuleSchema } from './retributionRuleSchema';

export const campaignCreateSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['territory_id', 'name', 'description', 'start', 'end', 'unit', 'status', 'retribution_rules'],
  properties: {
    parent_id: {
      macro: 'objectid',
    },
    ui_status: {
      type: 'object',
    },
    territory_id: {
      macro: 'objectid',
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
    status: {
      type: 'string',
      const: 'draft',
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
};
