export const alias = 'territory.findGeoByCode';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['insees'],
  additionalProperties: false,
  properties: {
    insees: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'string',
      },
    },
  },
};
export const binding = [alias, schema];
