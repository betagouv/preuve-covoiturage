import { operatorCreateSchema } from './operatorCreateSchema';

const update = JSON.parse(JSON.stringify(operatorCreateSchema));

export const operatorUpdateSchema = {
  $id: 'operator.update',
  type: 'object',
  required: ['_id', 'nom_commercial', 'raison_sociale'],
  additionalProperties: false,
  properties: {
    ...update.properties,
    _id: { macro: 'varchar' },
  },
};
