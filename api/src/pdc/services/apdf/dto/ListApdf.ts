import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { Serial } from "@/pdc/providers/superstruct/shared/index.ts";
export const ListApdf = object({
  campaign_id: Serial,
  operator_id: optional(Serial),
  territory_id: optional(Serial),
});

export type ListApdf = Infer<typeof ListApdf>;
