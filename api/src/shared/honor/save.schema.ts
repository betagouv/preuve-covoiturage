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
    employer: {
      type: 'string',
      minLength: 0,
      maxLength: 255,
    },
  },
};

export const binding = [alias, schema];
