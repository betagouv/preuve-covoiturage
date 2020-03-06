export const alias = 'application.revoke';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['uuid'],
  additionalProperties: false,
  properties: {
    uuid: { macro: 'dbid' },
  },
};
export const binding = [alias, schema];
