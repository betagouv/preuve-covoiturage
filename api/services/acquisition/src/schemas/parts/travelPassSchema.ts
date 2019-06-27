export const travelPassSchema = {
  type: 'object',
  required: ['name', 'userId'],
  additionalProperties: false,
  properties: {
    name: { macro: 'varchar' },
    userId: { macro: 'objectid' },
  },
};
