export const alias = 'company.find';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['query'],
  properties: {
    query: {
      type: 'object',
      additionalProperties: false,
      minProperties: 1,
      maxProperties: 1,
      properties: {
        siret: {
          macro: 'siret',
        },
        _id: {
          macro: 'serial',
        },
      },
    },
    forceRemoteUpdate: {
      type: 'boolean',
      default: false,
    },
  },
};

export const binding = [alias, schema];
