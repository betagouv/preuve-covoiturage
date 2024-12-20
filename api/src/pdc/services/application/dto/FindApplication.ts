import { defaulted, enums, Infer, object, union } from "@/lib/superstruct/index.ts";
import { Serial, Varchar } from "@/pdc/providers/superstruct/shared/index.ts";
export const FindApplication = object({
  uuid: Serial,
  owner_id: union([Serial, Varchar]),
  owner_service: defaulted(enums(["operator"]), "operator"),
});

export type FindApplication = Infer<typeof FindApplication>;
