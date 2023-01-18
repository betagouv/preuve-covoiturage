export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['territory_id', 'name', 'handler'],
  properties: {
    territory_id: {
      macro: 'serial',
    },
    name: {
      macro: 'varchar',
    },
    start_date: {
      macro: 'timestamp',
    },
    end_date: {
      macro: 'timestamp',
    },
    handler: {
      type: 'string',
      maxLength: 30,
      pattern: '^([A-Za-z0-9-_])*$',
    },
  },
};
