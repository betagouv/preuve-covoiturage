export const rule = {
  type: 'object',
  additionalProperties: false,
  required: ['slug'],
  properties: {
    slug: {
      type: 'string',
    },
    parameters: {},
  },
};
