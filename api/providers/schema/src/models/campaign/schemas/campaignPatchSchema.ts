import { ruleSchema } from './ruleSchema';

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
        global_rules: {
          type: 'array',
          minItems: 1,
          items: ruleSchema,
        },
        rules: {
          type: 'array',
          minItems: 1,
          items: ruleSchema,
        },
      },
    },
  },
};
