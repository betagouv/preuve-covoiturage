import { coerce, Infer, object, optional, string } from "@/lib/superstruct/index.ts";
import { DateOnly, Direction, Serial } from "@/pdc/providers/superstruct/shared/index.ts";

export const OperatorsByDay = object({
  territory_id: coerce(Serial, string(), (v) => parseInt(v)),
  date: optional(DateOnly),
  direction: optional(Direction),
});

export type OperatorsByDay = Infer<typeof OperatorsByDay>;
