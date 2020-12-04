export const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    tz: {
      macro: 'tz',
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
  },
};

export const alias = 'trip.export';
export const binding = [alias, schema];
