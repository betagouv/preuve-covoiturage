import { defaulted, Infer, integer, object, optional } from "@/lib/superstruct/index.ts";
import {
  CoerceNumberMinMax,
  Month,
  Semester,
  TerritoryCode,
  TerritoryType,
  Trimester,
  Year,
} from "@/pdc/providers/superstruct/shared/index.ts";

export const BestTerritories = object({
  year: Year,
  type: TerritoryType,
  code: TerritoryCode,
  observe: TerritoryType,
  month: optional(Month),
  trimester: optional(Trimester),
  semester: optional(Semester),
  limit: defaulted(CoerceNumberMinMax(integer(), 5, 100), 10),
});

export type BestTerritories = Infer<typeof BestTerritories>;
