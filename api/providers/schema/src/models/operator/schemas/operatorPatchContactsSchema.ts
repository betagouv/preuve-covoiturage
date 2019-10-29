import { contactsSchema } from '../../contacts/schemas/contactsSchema';

export const operatorPatchContactsSchema = {
  $id: 'operator.patchContacts',
  type: 'object',
  required: ['_id', 'patch'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
    patch: contactsSchema,
  },
};
