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
  hour: {
    type: 'object',
    required: ['start', 'end'],
    additionalProperties: false,
    properties: {
      start: {
        type: 'integer',
        minimum: 0,
        maximum: 23,
      },
      end: {
        type: 'integer',
        minimum: 0,
        maximum: 23,
        exclusiveMinimum: { $data: '1/start' },
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
    type: 'array',
    minItems: 1,
    items: { macro: 'serial' },
  },
  territory_id: {
    type: 'array',
    minItems: 1,
    items: { macro: 'serial' },
  },
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
  additionalProperties: false,
  properties: {
    ...params,
  },
};
