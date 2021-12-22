export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['date'],
  properties: {
    tz: {
      macro: 'tz',
    },
    date: {
      type: 'object',
      additionalProperties: false,
      required: ['start', 'end'],
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
    territory_id: {
      macro: 'serial',
    },
    territory_ids_filter: {
      type: 'array',
      minItems: 1,
      items: { macro: 'serial' },
    },
  },
};

export const alias = 'trip.export';
export const binding = [alias, schema];
