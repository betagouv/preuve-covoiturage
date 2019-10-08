import { contactsSchema } from '../../contacts/schemas/contactsSchema';

export const territoryPatchContactsSchema = {
  definitions: {
    contact: {
      type: 'object',
      additionalProperties: false,
      minProperties: 1,
      properties: contactsSchema.definitions.contact.properties,
    },
  },
  $id: 'territory.patchContacts',
  type: 'object',
  required: ['_id', 'patch'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
    patch: {
      type: 'object',
      minProperties: 1,
      additionalProperties: false,
      properties: contactsSchema.properties,
    },
  },
};
