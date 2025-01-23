import { defaulted, Infer, integer, object, optional } from "@/lib/superstruct/index.ts";
import {
  CoerceNumberMinMax,
  Direction,
  Month,
  Semester,
  TerritoryCode,
  TerritoryType,
  Trimester,
  Year,
} from "@/pdc/providers/superstruct/shared/index.ts";

export const BestFlux = object({
  year: Year,
  type: TerritoryType,
  code: TerritoryCode,
  month: optional(Month),
  trimester: optional(Trimester),
  semester: optional(Semester),
  direction: optional(Direction),
  limit: defaulted(CoerceNumberMinMax(integer(), 5, 100), 10),
});

export type BestFlux = Infer<typeof BestFlux>;
