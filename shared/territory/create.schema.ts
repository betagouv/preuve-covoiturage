import { contacts } from '../common/schemas/contacts';

export const alias = 'territory.create';
export const create = {
  $id: alias,
  type: 'object',
  required: ['level', 'name'],
  additionalProperties: false,
  properties: {
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
    active_since: {
      macro: 'timestamp',
    },
    density: {
      type: 'integer',
      minimum: 0,
    },
    // geo: {
    //  TODO geography type
    // },

    // Meta code
    insee: {
      type: 'array',
      items: { macro: 'insee' },
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
    // Relation
    children: {
      type: 'array',
      items: { macro: 'serial' },
    },
  },
};
