export const alias = 'territory.dropdown';
export const dropdown = {
  $id: alias,
  type: 'object',
  additionalProperties: false,
  properties: {
    search: {
      type: 'string',
      minLength: 1,
      maxLength: 256,
    },
    parent_id: {
      macro: 'serial',
    },
  },
};
