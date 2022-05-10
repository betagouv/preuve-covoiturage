export const alias = 'territory.findGeoByCode';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['siren'],
  additionalProperties: false,
  properties: {
    siren: { macro: 'siret' },
  },
};
export const binding = [alias, schema];
