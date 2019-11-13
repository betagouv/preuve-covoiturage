import { create as createSchema } from './create.schema';

const upd = JSON.parse(JSON.stringify(createSchema));

export const alias = 'territory.update';
export const update = {
  $id: alias,
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'name', 'siret'],
  properties: {
    ...upd.properties,
    _id: { macro: 'serial' },
  },
};
