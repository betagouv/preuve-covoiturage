import { defaulted, enums, Infer, object } from "@/lib/superstruct/index.ts";
import { Serial } from "@/pdc/providers/superstruct/shared/index.ts";
export const ListApplication = object({
  owner_id: Serial,
  owner_service: defaulted(enums(["operator"]), "operator"),
});

export type ListApplication = Infer<typeof ListApplication>;
