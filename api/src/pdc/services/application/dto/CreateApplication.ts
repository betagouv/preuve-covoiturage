import { array, defaulted, enums, Infer, object } from "@/lib/superstruct/index.ts";
import { Serial, Varchar } from "@/pdc/providers/superstruct/shared/index.ts";

export const CreateApplication = object({
  name: Varchar,
  owner_id: Serial,
  owner_service: defaulted(enums(["operator"]), "operator"),
  permissions: defaulted(array(Varchar), []),
});

export type CreateApplication = Infer<typeof CreateApplication>;
