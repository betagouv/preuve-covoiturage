export const alias = 'company.find';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['siret'],
  properties: {
    siret: {
      macro: 'siret',
    },
    source: {
      type: 'string',
      enum: ['local', 'remote'],
      default: 'local',
    },
  },
};

export const binding = [alias, schema];
