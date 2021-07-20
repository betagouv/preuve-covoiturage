export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['date', 'publish'],
  properties: {
    date: {
      macro: 'timestamp',
    },
    publish: {
      macro: 'boolean',
    },
  },
};

export const alias = 'trip.publishOpenData';
export const binding = [alias, schema];
