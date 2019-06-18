export const territoryDeleteSchema = {
  $id: 'territory.delete',
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { macro: 'objectid' },
  },
};
