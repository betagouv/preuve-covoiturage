import { contacts } from '../common/schemas/contacts.ts';

export const alias = 'territory.patchContacts';
export const patchContacts = {
  $id: alias,
  type: 'object',
  required: ['_id', 'patch'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'serial' },
    patch: contacts,
  },
};
