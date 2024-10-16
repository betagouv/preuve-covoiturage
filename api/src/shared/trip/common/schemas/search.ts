import { territoryCodeSchema } from '../../../territory/common/schema.ts';

const params = {
  tz: {
    macro: 'tz',
  },
  campaign_id: {
    type: 'array',
    items: { macro: 'serial' },
    minItems: 1,
  },
  date: {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
      start: {
        macro: 'timestamp',
      },
      end: {
        macro: 'timestamp',
      },
    },
  },
  days: {
    type: 'array',
    minItems: 1,
    items: {
      type: 'integer',
      minimum: 0,
      maximum: 6,
    },
  },
  status: {
    type: 'string',
  },
  distance: {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
      min: {
        type: 'integer',
        minimum: 0,
        maximum: 150000,
      },
      max: {
        type: 'integer',
        minimum: 0,
        maximum: 150000,
      },
    },
  },
  ranks: {
    type: 'array',
    minItems: 1,
    items: {
      type: 'string',
      maxLength: 1,
      minLength: 1,
    },
  },
  operator_id: {
    oneOf: [
      {
        type: 'array',
        minItems: 1,
        items: { macro: 'serial' },
      },
      {
        macro: 'serial',
      },
    ],
  },
  geo_selector: territoryCodeSchema,
};

export const search = {
  type: 'object',
  required: ['skip', 'limit'],
  additionalProperties: false,
  properties: {
    ...params,
    skip: {
      type: 'integer',
      minimum: 0,
      maximum: 2147483647,
      default: 0,
    },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 10,
    },
  },
};

export const stats = {
  type: 'object',
  required: ['tz', 'group_by'],
  additionalProperties: false,
  properties: {
    ...params,
    group_by: {
      type: 'string',
      enum: ['month', 'day', 'all'],
    },
  },
};
