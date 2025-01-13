import { coerce, Infer, object, string } from "@/lib/superstruct/index.ts";
import { Direction, Serial, Year } from "@/pdc/providers/superstruct/shared/index.ts";

export const IncentiveByMonth = object({
  territory_id: coerce(Serial, string(), (v) => parseInt(v)),
  year: Year,
  direction: Direction,
});

export type IncentiveByMonth = Infer<typeof IncentiveByMonth>;
