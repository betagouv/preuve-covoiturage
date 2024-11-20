import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { JourneyStatus, Limit, Offset, Serial, Timestamp } from "@/pdc/services/acquisition/dto/shared.ts";

export const ListJourney = object({
  operator_id: Serial,
  status: JourneyStatus,
  limit: optional(Limit),
  offset: optional(Offset),
  start: optional(Timestamp),
  end: optional(Timestamp),
});

export type ListJourney = Infer<typeof ListJourney>;
