import { schema as createSchema } from './create.schema.ts';

const update = JSON.parse(JSON.stringify(createSchema));

export const alias = 'operator.update';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  minProperties: 2,
  properties: {
    ...update.properties,
    _id: { macro: 'serial' },
  },
};
export const binding = [alias, schema];
