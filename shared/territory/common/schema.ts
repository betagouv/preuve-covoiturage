import { contacts } from '../../common/schemas/contacts';

export function schema(alias: string, extrafields: { [k: string]: any } = {}) {
  const extrafieldKeys = Reflect.ownKeys(extrafields);
  return {
    $id: alias,
    type: 'object',
    required: ['name', 'address', 'level', 'children', 'parent', ...extrafieldKeys],
    additionalProperties: true,
    properties: {
      contacts: { contacts },
      company_id: { macro: 'serial' },
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
      parent: { macro: 'serial' },
      children: {
        type: 'array',
        items: { macro: 'serial' },
      },
      name: { macro: 'varchar' },
      ...extrafields,
    },
  };
}
