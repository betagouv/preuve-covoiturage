import { ruleSchema } from './ruleSchema';

export const campaignCreateSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['territory_id', 'name', 'start', 'end', 'unit', 'status', 'rules', 'global_rules'],
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
      default: '',
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
      enum: ['draft', 'template'],
    },
    global_rules: {
      type: 'array',
      items: ruleSchema,
    },
    rules: {
      type: 'array',
      items: ruleSchema,
    },
  },
};
