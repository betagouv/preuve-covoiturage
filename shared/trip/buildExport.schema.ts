export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['query', 'from'],
  properties: {
    query: {
      type: 'object',
      additionalProperties: false,
      required: ['date'],
      properties: {
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
        territory_authorized_operator_id: {
          type: 'array',
          minItems: 1,
          items: { macro: 'serial' },
        },
      },
    },
    from: {
      type: 'object',
      additionalProperties: false,
      required: ['email', 'fullname'],
      properties: {
        email: {
          macro: 'email',
        },
        fullname: {
          macro: 'varchar',
        },
        type: {
          macro: 'varchar',
        },
      },
    },
    type: {
      macro: 'varchar',
    },
  },
};

export const alias = 'trip.export';
export const binding = [alias, schema];
