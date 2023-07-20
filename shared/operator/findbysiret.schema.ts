export const alias = 'operator.findbysiret';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['siret'],
  additionalProperties: false,
  properties: {
    siret: {
      type: 'array',
      items: { macro: 'siret' },
      minItems: 1,
      maxItems: 50,
    },
  },
};
export const binding = [alias, schema];
