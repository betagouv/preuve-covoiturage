import { allProjectionFields } from './common/interfaces/TerritoryQueryInterface';

export const alias = 'territory.find';
export const find = {
  $id: alias,
  type: 'object',
  required: ['query'],
  additionalProperties: false,
  properties: {
    query: {
      type: 'object',
      // minProperties: 1,
      // maxProperties: 2,
      additionalProperties: false,
      properties: {
        _id: { macro: 'serial' },
        insee: { macro: 'insee' },
        postcode: { macro: 'postcode' },
        active: { type: 'boolean' },
        search: { type: 'string' },
        company_name: { type: 'string' },
        has_child_id: {
          type: 'number',
        },
        has_parent_id: {
          type: 'number',
        },

        has_ancestor_id: {
          type: 'number',
        },
        has_descendant_id: {
          type: 'number',
        },

        position: {
          type: 'object',
          required: ['lat', 'lon'],
          additionalProperties: false,
          properties: {
            lat: { macro: 'lat' },
            lon: { macro: 'lon' },
          },
        },
      },
    },
    sort: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['name ASC', 'name DESC' /*, '+area', '-area' */],
      },
    },
    projection: {
      type: 'array',
      items: {
        type: 'string',
        enum: allProjectionFields,
      },
    },
  },
};
