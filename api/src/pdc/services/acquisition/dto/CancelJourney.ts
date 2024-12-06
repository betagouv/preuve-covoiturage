import { Infer, object, optional, pattern, size, string } from "@/lib/superstruct/index.ts";
import { OperatorJourneyId, Serial } from "./shared.ts";
const CancelMessage = size(string(), 0, 512);
const CancelCode = pattern(string(), /^[0-9A-Za-z_-]{0,32}$/);

export const CancelJourney = object({
  operator_id: Serial,
  operator_journey_id: OperatorJourneyId,
  code: CancelCode,
  message: optional(CancelMessage),
});
export type CancelJourney = Infer<typeof CancelJourney>;
