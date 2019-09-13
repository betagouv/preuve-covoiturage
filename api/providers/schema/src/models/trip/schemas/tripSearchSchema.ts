export const tripSearchSchema = {
  $id: 'trip.search',
  type: 'object',
  required: ['skip', 'limit'],
  additionalProperties: false,
  properties: {
    campaign_id: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,
    },
    date: {
      type: 'object',
      additionalProperties: false,
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
    towns: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'string',
      },
    },
    distance: {
      type: 'object',
      additionalProperties: false,
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
      items: {
        macro: 'objectid',
      },
    },
    territory_id: {
      type: 'array',
      minItems: 1,
      items: {
        macro: 'objectid',
      },
    },
    skip: {
      type: 'integer',
      minimum: 0,
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
