export const alias = 'certificate.download';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['uuid', 'type'],
  additionalProperties: false,
  properties: {
    uuid: { type: 'string', format: 'uuid', minLength: 36, maxLength: 36 },
    type: {
      type: 'string',
      enum: ['json', 'pdf', 'png'],
      minLength: 3,
      maxLength: 4,
    },
  },
};
export const binding = [alias, schema];
