export const territoryFindByInseeSchema = {
  $id: 'territory.findByInsee',
  type: 'object',
  required: ['insee'],
  additionalProperties: false,
  properties: {
    insee: { macro: 'insee' },
  },
};
