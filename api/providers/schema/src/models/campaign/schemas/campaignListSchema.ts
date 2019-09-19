export const campaignListSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    status: {
      const: 'template',
    },
  },
};
