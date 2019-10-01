export const campaignDeleteSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'territory_id'],
  properties: {
    _id: {
      macro: 'objectid',
    },
    territory_id: {
      macro: 'objectid',
    },
  },
};
