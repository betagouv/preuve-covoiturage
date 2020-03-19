export const alias = 'application.find';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['uuid'],
  additionalProperties: false,
  properties: {
    uuid: { macro: 'dbid' },
    owner_id: { anyOf: [{ macro: 'serial' }, { macro: 'varchar' }] },
    owner_service: { enum: ['operator'] },
  },
};
export const binding = [alias, schema];
