export const campaignLaunchSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['_id'],
  properties: {
    _id: {
      macro: 'objectid',
    },
  },
};
