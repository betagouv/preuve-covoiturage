import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { DateOnly, Direction, Id } from "@/pdc/providers/superstruct/shared/index.ts";

export const IncentiveByDay = object({
  territory_id: Id,
  date: optional(DateOnly),
  direction: optional(Direction),
});

export type IncentiveByDay = Infer<typeof IncentiveByDay>;
