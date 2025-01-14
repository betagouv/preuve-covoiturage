import { coerce, Infer, object, optional, string } from "@/lib/superstruct/index.ts";
import { Direction, Serial, Year } from "@/pdc/providers/superstruct/shared/index.ts";

export const OperatorsByMonth = object({
  territory_id: coerce(Serial, string(), (v) => parseInt(v)),
  year: optional(Year),
  direction: optional(Direction),
});

export type OperatorsByMonth = Infer<typeof OperatorsByMonth>;
