export const alias = 'operator.getuploadurl';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['contentType'],
  additionalProperties: false,
  properties: {
    contentType: {
      macro: 'imageContentType',
    },
  },
};
export const binding = [alias, schema];
