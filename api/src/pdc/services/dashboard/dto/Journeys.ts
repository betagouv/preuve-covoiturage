import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { DateOnly, Direction, Id, Year } from "@/pdc/providers/superstruct/shared/index.ts";

export const JourneysByDay = object({
  territory_id: Id,
  date: optional(DateOnly),
  direction: optional(Direction),
});
export const JourneysByMonth = object({
  territory_id: Id,
  year: optional(Year),
  direction: optional(Direction),
});

export type JourneysByMonth = Infer<typeof JourneysByMonth>;
export type JourneysByDay = Infer<typeof JourneysByDay>;
