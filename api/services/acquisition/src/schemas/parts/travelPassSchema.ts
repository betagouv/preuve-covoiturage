export const travelPassSchema = {
  type: 'object',
  minProperties: 2,
  additionalProperties: false,
  properties: {
    name: { macro: 'varchar' },
    user_id: { macro: 'objectid' },
  },
};
