import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { DateOnly, Id, Year } from "@/pdc/providers/superstruct/shared/index.ts";

export const JourneysByDay = object({
  campaign_id: Id,
  date: optional(DateOnly),
});
export const JourneysByMonth = object({
  campaign_id: Id,
  year: optional(Year),
});

export type JourneysByMonth = Infer<typeof JourneysByMonth>;
export type JourneysByDay = Infer<typeof JourneysByDay>;
