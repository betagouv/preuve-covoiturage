import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { Id } from "@/pdc/providers/superstruct/shared/index.ts";

export const Campaigns = object({
  territory_id: optional(Id),
});

export type Campaigns = Infer<typeof Campaigns>;
