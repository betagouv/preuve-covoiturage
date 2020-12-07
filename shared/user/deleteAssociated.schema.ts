export const deleteAssociatedUser = {
  $id: 'user.deleteAssociated',
  type: 'object',
  additionalProperties: false,
  properties: {
    territory_id: { macro: 'serial' },
    operator_id: { macro: 'serial' },
  },
  oneOf: [{ required: ['territory_id'] }, { required: ['operator_id'] }],
};

export const alias = deleteAssociatedUser.$id;
