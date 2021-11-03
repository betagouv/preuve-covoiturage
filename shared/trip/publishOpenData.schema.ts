export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['filepath'],
  properties: {
    filepath: {
      macro: 'varchar',
    },
  },
};

export const alias = 'trip.publishOpenData';
export const binding = [alias, schema];
