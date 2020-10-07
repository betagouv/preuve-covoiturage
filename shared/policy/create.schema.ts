import { rule } from './common/schemas/rule';

export const alias = 'campaign.create';

export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['territory_id', 'name', 'start_date', 'end_date', 'unit', 'status', 'rules', 'global_rules'],
  properties: {
    parent_id: {
      macro: 'serial',
    },
    ui_status: {
      type: 'object',
    },
    territory_id: {
      macro: 'serial',
    },
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
      default: '',
    },
    start_date: {
      macro: 'timestamp',
    },
    end_date: {
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
      items: rule,
    },
    rules: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'array',
        minItems: 1,
        items: rule,
      },
    },
  },
};

export const binding = [alias, schema];
