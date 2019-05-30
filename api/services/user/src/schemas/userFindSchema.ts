export const userFindSchema = {
  $id: 'user.find',
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
    },
    aom: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
    },
    operator: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
    },
  },
};
