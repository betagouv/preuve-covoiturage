export const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    territory_id: { macro: 'serial' },
    operator_id: { macro: 'serial' },
  },
};

export const alias = 'capitalcall.export';
export const binding = [alias, schema];
