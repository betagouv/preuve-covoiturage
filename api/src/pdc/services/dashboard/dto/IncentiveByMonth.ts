import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { Direction, Id, Year } from "@/pdc/providers/superstruct/shared/index.ts";

export const IncentiveByMonth = object({
  territory_id: Id,
  year: optional(Year),
  direction: optional(Direction),
});

export type IncentiveByMonth = Infer<typeof IncentiveByMonth>;
