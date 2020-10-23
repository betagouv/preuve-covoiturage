export const alias = 'honor.save';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['type'],
  properties: {
    type: {
      type: 'string',
      enum: ['public', 'limited'],
    },
  },
};

export const binding = [alias, schema];
