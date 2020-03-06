export const alias = 'territory.findByInsee';
export const findByInsee = {
  $id: alias,
  type: 'object',
  required: ['insee'],
  additionalProperties: false,
  properties: {
    insee: { macro: 'insee' },
  },
};
