import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { Id } from "@/pdc/providers/superstruct/shared/index.ts";

export const Campaigns = object({
  territory_id: optional(Id),
  operator_id: optional(Id),
  page: optional(Id),
  limit: optional(Id),
});

export type Campaigns = Infer<typeof Campaigns>;
