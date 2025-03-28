import { contacts } from "../../../../shared/common/schemas/contacts.ts";

export const alias = "operator.patchContacts";
export const schema = {
  $id: alias,
  type: "object",
  required: ["_id", "patch"],
  additionalProperties: false,
  properties: {
    _id: { macro: "serial" },
    patch: contacts,
  },
};
export const binding = [alias, schema];
