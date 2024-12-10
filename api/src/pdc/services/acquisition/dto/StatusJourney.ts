import { Infer, object } from "@/lib/superstruct/index.ts";
import { OperatorJourneyId, Serial } from "@/pdc/services/acquisition/dto/shared.ts";

export const StatusJourney = object({
  operator_id: Serial,
  operator_journey_id: OperatorJourneyId,
});

export type StatusJourney = Infer<typeof StatusJourney>;
