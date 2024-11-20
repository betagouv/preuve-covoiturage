import { defaulted, enums, Infer, object } from "@/lib/superstruct/index.ts";
import { Serial } from "@/pdc/providers/superstruct/shared/index.ts";
export const RevokeApplication = object({
  owner_id: Serial,
  owner_service: defaulted(enums(["operator"]), "operator"),
  uuid: Serial,
});

export type RevokeApplication = Infer<typeof RevokeApplication>;
