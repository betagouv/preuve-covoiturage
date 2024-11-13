import { pagination } from '../common/schemas/pagination.ts';
export const alias = 'territory.list';
export const schema = {
  $id: alias,
  type: 'object',
  required: [],
  additionalProperties: false,
  properties: {
    search: { macro: 'varchar' },
    ...pagination,
  },
};
export const binding = [alias, schema];
