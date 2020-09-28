export const deleteAssociatedUser = {
  $id: 'user.deleteAssociated',
  type: 'object',
  additionalProperties: false,
  properties: {
    territory_id: { type: 'integer' },
    operator_id: { type: 'integer' },
  },
  oneOf: [{ required: ['territory_id'] }, { required: ['operator_id'] }],
};

export const alias = deleteAssociatedUser.$id;
