export const alias = 'territory.findByInsees';
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
