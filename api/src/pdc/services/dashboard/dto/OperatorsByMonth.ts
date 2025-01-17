import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { Direction, Id, Year } from "@/pdc/providers/superstruct/shared/index.ts";

export const OperatorsByMonth = object({
  territory_id: Id,
  year: optional(Year),
  direction: optional(Direction),
});

export type OperatorsByMonth = Infer<typeof OperatorsByMonth>;
