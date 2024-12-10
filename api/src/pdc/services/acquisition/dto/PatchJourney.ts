import { array, Infer, object, optional, size, unknown } from "@/lib/superstruct/index.ts";
import {
  Distance,
  ExternalId,
  Incentive,
  OperatorClass,
  OperatorJourneyId,
  Serial,
  TimeGeoPoint,
} from "@/pdc/services/acquisition/dto/shared.ts";

export const PatchJourney = object({
  operator_id: Serial,
  operator_journey_id: OperatorJourneyId,
  operator_trip_id: optional(ExternalId),
  operator_class: OperatorClass,
  start: TimeGeoPoint,
  end: TimeGeoPoint,
  distance: Distance,
  incentives: optional(size(array(Incentive), 0, 20)),
  incentive_counterparts: optional(unknown()),
});

export type PatchJourney = Infer<typeof PatchJourney>;
