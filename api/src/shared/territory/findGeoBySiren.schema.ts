export const alias = 'territory.findGeoByCode';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['siren'],
  additionalProperties: false,
  properties: {
    siren: { macro: 'varchar' }, // TODO: Add a siren macro
  },
};
export const binding = [alias, schema];
