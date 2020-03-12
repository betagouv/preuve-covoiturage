export const alias = 'carpool.find';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['acquisition_id'],
  additionalProperties: false,
  properties: {
    acquisition_id: { macro: 'serial' },
  },
};

export const binding = [alias, schema];
