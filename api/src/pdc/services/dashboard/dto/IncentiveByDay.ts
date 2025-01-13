import { coerce, Infer, object, string } from "@/lib/superstruct/index.ts";
import { DateOnly, Direction, Serial } from "@/pdc/providers/superstruct/shared/index.ts";

export const IncentiveByDay = object({
  territory_id: coerce(Serial, string(), (v) => parseInt(v)),
  date: DateOnly,
  direction: Direction,
});

export type IncentiveByDay = Infer<typeof IncentiveByDay>;
