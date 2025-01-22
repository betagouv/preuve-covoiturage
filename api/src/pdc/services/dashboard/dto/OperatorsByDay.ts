import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { DateOnly, Direction, Id } from "@/pdc/providers/superstruct/shared/index.ts";

export const OperatorsByDay = object({
  territory_id: Id,
  date: optional(DateOnly),
  direction: optional(Direction),
});

export type OperatorsByDay = Infer<typeof OperatorsByDay>;
