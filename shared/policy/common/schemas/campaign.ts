export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['territory_id', 'name', 'uses'],
  properties: {
    territory_id: {
      macro: 'serial'
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
  },
};