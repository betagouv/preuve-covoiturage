import { defaulted, enums, Infer, integer, object, optional } from "@/lib/superstruct/index.ts";
import {
  CoerceNumberMinMax,
  Month,
  Semester,
  TerritoryCode,
  TerritoryType,
  Trimester,
  Year,
} from "@/pdc/providers/superstruct/shared/index.ts";

export const EvolOccupation = object({
  year: Year,
  type: TerritoryType,
  code: TerritoryCode,
  month: optional(Month),
  trimester: optional(Trimester),
  semester: optional(Semester),
  indic: enums(["journeys", "trips", "has_incentive", "occupation_rate", "distance"]),
  past: defaulted(CoerceNumberMinMax(integer(), 1, 5), 2),
});

export type EvolOccupation = Infer<typeof EvolOccupation>;
