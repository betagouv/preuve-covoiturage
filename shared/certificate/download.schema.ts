export const alias = 'certificate.download';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['uuid', 'type'],
  additionalProperties: false,
  properties: {
    uuid: { macro: 'uuid' },
    type: {
      type: 'string',
      enum: ['pdf', 'png'],
      minLength: 3,
      maxLength: 3,
    },
  },
};
export const binding = [alias, schema];
