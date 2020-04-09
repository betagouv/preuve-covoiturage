import { contacts } from '../common/schemas/contacts';

export const alias = 'territory.update';

export const update = {
  $id: alias,
  type: 'object',
  required: ['_id', 'level', 'name'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'serial' },
    contacts,
    name: { macro: 'varchar' },
    level: {
      type: 'string',
      enum: [
        'town',
        'towngroup',
        'district',
        'megalopolis',
        'region',
        'state',
        'country',
        'countrygroup',
        'other',
      ],
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
  },
};


