import { contacts } from '../common/schemas/contacts';

export const alias = 'territory.update';

export const update = {
  $id: alias,
  type: 'object',
  required: ['_id', 'level', 'name'],
  additionalProperties: false,

  definitions: {
    GeoPolys: {
      $ref: 'http://json-schema.org/draft-07/schema#',
    },
  },

  properties: {
    _id: { macro: 'serial' },
    contacts,
    name: { macro: 'varchar' },
    shortname: { macro: 'varchar' },
    level: {
      type: 'string',
      enum: ['town', 'towngroup', 'district', 'megalopolis', 'region', 'state', 'country', 'countrygroup', 'other'],
    },
    company_id: {
      macro: 'serial',
    },
    active: {
      type: 'boolean',
      default: false,
    },
    activable: {
      type: 'boolean',
      default: false,
    },
    density: {
      type: 'integer',
      minimum: 0,
    },

    // Meta code
    insee: {
      type: 'array',
      items: { macro: 'insee' },
    },

    geo: {
      $ref: '#/definitions/GeoPolys',
    },

    postcode: {
      type: 'array',
      items: { macro: 'postcode' },
    },
    address: {
      city: { type: 'string' },
      country: { type: 'string' },
      postcode: { type: 'string' },
      street: { type: 'string' },
    },
    ui_status: {
      type: 'object',
    },
    // Relation
    children: {
      type: 'array',
      items: { macro: 'serial' },
    },
  },
};
