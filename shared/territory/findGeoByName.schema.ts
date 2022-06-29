import { pagination } from '../common/schemas/pagination';

export const alias = 'territory.listGeo';
export const schema = {
  $id: alias,
  type: 'object',
  additionalProperties: false,
  required: ['search'],
  properties: {
    search: {
      type: 'string',
      minLength: 2,
      maxLength: 256,
    },
    where: {
      type: 'object',
      additionalProperties: false,
      properties: {
        insee: {
          type: 'array',
          items: { macro: 'insee' },
        },
      },
    },
    ...pagination,
  },
};
export const binding = [alias, schema];
