import { create as createSchema } from './create.schema';

const upd = JSON.parse(JSON.stringify(createSchema));

export const alias = 'territory.update';
export const update = {
  $id: alias,
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  minProperties: 2,
  properties: {
    ...upd.properties,
    _id: { macro: 'serial' },
  },
};
