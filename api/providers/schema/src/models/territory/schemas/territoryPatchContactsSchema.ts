import { contactsSchema } from '../../contacts/schemas/contactsSchema';

export const territoryPatchContactsSchema = {
  $id: 'territory.patchContacts',
  type: 'object',
  required: ['_id', 'patch'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
    patch: contactsSchema,
  },
};
