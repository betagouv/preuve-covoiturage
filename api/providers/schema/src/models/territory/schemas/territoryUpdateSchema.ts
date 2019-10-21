import { territoryCreateSchema } from './territoryCreateSchema';

const update = JSON.parse(JSON.stringify(territoryCreateSchema));

export const territoryUpdateSchema = {
  $id: 'territory.update',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'name'],
  properties: {
    ...update.properties,
    _id: { macro: 'varchar' },
  },
};
