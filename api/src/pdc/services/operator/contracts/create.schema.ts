import { address } from "../../../../shared/common/schemas/address.ts";
import { bank } from "../../../../shared/common/schemas/bank.ts";
import { cgu } from "../../../../shared/common/schemas/cgu.ts";
import { company } from "../../../../shared/common/schemas/company.ts";
import { contacts } from "../../../../shared/common/schemas/contacts.ts";

export const alias = "operator.create";
export const schema = {
  $id: alias,
  type: "object",
  required: ["name", "legal_name", "siret"],
  additionalProperties: false,
  properties: {
    company,
    address,
    bank,
    contacts,
    cgu,
    name: { macro: "varchar" },
    legal_name: { macro: "varchar" },
    siret: { macro: "siret" },
    thumbnail: { anyOf: [{ macro: "base64" }, { type: "null" }] },
  },
};
export const binding = [alias, schema];
