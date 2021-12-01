import { contacts } from '../../common/schemas/contacts';

export function schema(alias: string, extrafields: { [k: string]: any } = {}) {
  const extrafieldKeys = Reflect.ownKeys(extrafields);
  return {
    $id: alias,
    type: 'object',
    required: ['name', 'insee', 'company_id', ...extrafieldKeys],
    additionalProperties: false,
    properties: {
      contacts: { contacts },
      company_id: {},
      address: {
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
      },
      insee: {
        type: 'array',
        uniqueItems: true,
        minItems: 0,
        maxItems: 2000,
        items: { macro: 'insee' },
      },
      name: { macro: 'varchar' },
      ...extrafields,
    },
  };
}
