import { contacts } from '../../common/schemas/contacts';
import { MultiPolygonSchema } from '../common/geojson/MultiPolygonSchema';

const commonFields = {
  name: {},
  shortname: {},
  level: {},
  activable: {},
  ui_status: {},
};

const geoFields = {
  geo: {},
  density: {},
  insee: {},
  postcode: {},
  children: {},
};

const activeFields = {
  contacts: {},
  activable: {},
  active: {},
  company_id: {},
  address: {},
};

export function schema(alias: string, extrafields: { [k: string]: any } = {}) {
  const extrafieldKeys = Reflect.ownKeys(extrafields);
  return {
    $id: alias,
    allOf: [
      {
        type: 'object',
        required: ['name', 'level', 'activable', 'active', ...extrafieldKeys],
        additionalProperties: false,
        properties: {
          ...activeFields,
          ...geoFields,
          ...extrafields,
          name: { macro: 'varchar' },
          shortname: { macro: 'varchar' },
          activable: { type: 'boolean' },
          active: { type: 'boolean' },
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
          ui_status: {
            type: 'object',
          },
        },
      },
      {
        // activable: false && active: false -> no company, address, contacts
        // otherwise, require the company, address, contacts
        if: {
          properties: {
            activable: { type: 'boolean', const: false },
            active: { type: 'boolean', const: false },
          },
        },
        then: {
          type: 'object',
          required: ['name', 'level', 'activable', 'active', ...extrafieldKeys],
          additionalProperties: false,
          properties: {
            ...commonFields,
            ...geoFields,
            ...extrafields,
            activable: { type: 'boolean', const: false },
            active: { type: 'boolean', const: false },
          },
        },
        else: {
          type: 'object',
          required: ['name', 'level', 'activable', 'active', 'company_id', 'address', ...extrafieldKeys],
          additionalProperties: false,
          properties: {
            ...commonFields,
            ...geoFields,
            ...extrafields,
            contacts,
            activable: { type: 'boolean' },
            active: { type: 'boolean' },
            company_id: {
              macro: 'serial',
            },
            address: {
              city: { type: 'string' },
              country: { type: 'string' },
              postcode: { type: 'string' },
              street: { type: 'string' },
            },
          },
        },
      },
      {
        oneOf: [
          {
            type: 'object',
            required: ['geo'],
            additionalProperties: false,
            properties: {
              ...commonFields,
              ...activeFields,
              ...extrafields,
              geo: MultiPolygonSchema,
              density: {
                type: 'integer',
                minimum: 0,
                maximum: 100000,
              },
              insee: {
                type: 'array',
                uniqueItems: true,
                minItems: 0,
                maxItems: 2000,
                items: { macro: 'insee' },
              },
              postcode: {
                type: 'array',
                uniqueItems: true,
                minItems: 0,
                maxItems: 2000,
                items: { macro: 'postcode' },
              },
            },
          },
          {
            type: 'object',
            required: ['children'],
            additionalProperties: false,
            properties: {
              ...commonFields,
              ...activeFields,
              ...extrafields,

              children: {
                type: 'array',
                items: { macro: 'serial' },
              },
            },
          },
        ],
      },
    ],
  };
}
