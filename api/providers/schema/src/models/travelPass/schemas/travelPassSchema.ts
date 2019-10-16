export const travelPassSchema = {
  type: 'object',
  minProperties: 2,
  additionalProperties: false,
  properties: {
    name: { macro: 'varchar', enum: ['navigo'] },
    user_id: { macro: 'varchar' },
  },
};
