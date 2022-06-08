import { contacts } from '../../common/schemas/contacts';
import { TerritoryCodeEnum } from './interfaces/TerritoryCodeInterface';

export const territoryCodeSchema = {
  type: 'object',
  minProperties: 1,
  maxPropeties: 3,
  propertyNames: {
    enum: [...Object.values(TerritoryCodeEnum)],
  },
  additionalProperties: {
    type: 'array',
    items: { type: 'string' },
  },
};

export function schema(alias: string, update = false) {
  return {
    $id: alias,
    type: 'object',
    required: ['address', 'contacts', 'company_id', ...(update ? ['_id'] : [])],
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
      selector: territoryCodeSchema,
      name: { macro: 'varchar' },
      ...(update ? { _id: { macro: 'serial' } } : {}),
    },
  };
}
