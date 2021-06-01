import { contacts } from '../../common/schemas/contacts';
import { MultiPolygonSchema } from '../common/geojson/MultiPolygonSchema';

const address = {
  type: 'object',
  required: ['city', 'country', 'postcode', 'street'],
  additionalProperties: false,
  properties: {
    city: { type: 'string' },
    country: { type: 'string' },
    postcode: { type: 'string' },
    street: { type: 'string' },
    cedex: { type: 'string' },
  },
};

const commonFields = {
  name: {},
  shortname: {},
  level: {},
  ui_status: {},
};

const geoFields = {
  // geo: {},
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
        required: ['name', 'level', ...extrafieldKeys],
        additionalProperties: false,
        properties: {
          ...activeFields,
          ...geoFields,
          ...extrafields,
          name: { macro: 'varchar' },
          shortname: { macro: 'varchar' },
          ui_status: { type: 'object' },
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
        },
      },
      {
        oneOf: [
          {
            type: 'object',
            properties: {
              ...commonFields,
              ...geoFields,
              ...extrafields,
              active: { const: false },
              activable: { const: false },
            },
          },
          {
            type: 'object',
            required: ['company_id', 'address'],
            additionalProperties: false,
            properties: {
              ...commonFields,
              ...geoFields,
              ...extrafields,
              contacts,
              address,
              company_id: { macro: 'serial' },
              active: { const: true },
              activable: { const: false },
            },
          },
          {
            type: 'object',
            required: ['company_id', 'address'],
            additionalProperties: false,
            properties: {
              ...commonFields,
              ...geoFields,
              ...extrafields,
              contacts,
              address,
              company_id: { macro: 'serial' },
              active: { const: false },
              activable: { const: true },
            },
          },
          {
            type: 'object',
            required: ['company_id', 'address'],
            additionalProperties: false,
            properties: {
              ...commonFields,
              ...geoFields,
              ...extrafields,
              contacts,
              address,
              company_id: { macro: 'serial' },
              active: { const: true },
              activable: { const: true },
            },
          },
        ],
      },
      {
        oneOf: [
          {
            type: 'object',
            // required: ['geo'],
            additionalProperties: false,
            properties: {
              ...commonFields,
              ...activeFields,
              ...extrafields,
              // geo: MultiPolygonSchema,
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
