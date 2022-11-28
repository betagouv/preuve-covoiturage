export const alias = 'observatory.stats';
export const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    l_arr: { type: 'string' }, 
  },
};

export const binding = [alias, schema];