import { schema as createSchema } from './create.schema';

const update = JSON.parse(JSON.stringify(createSchema));

export const alias = 'operator.update';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['_id', 'nom_commercial', 'raison_sociale'],
  additionalProperties: false,
  properties: {
    ...update.properties,
    _id: { macro: 'varchar' },
  },
};
export const binding = [alias, schema];
