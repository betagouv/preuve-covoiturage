import { rule } from './common/schemas/rule';

export const alias = 'campaign.patch';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'patch'],
  properties: {
    _id: {
      macro: 'serial',
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
        global_rules: {
          type: 'array',
          minItems: 1,
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
    },
  },
};

export const binding = [alias, schema];
