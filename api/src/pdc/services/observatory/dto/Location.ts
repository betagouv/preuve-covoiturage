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

export const Location = object({
  year: Year,
  type: TerritoryType,
  code: TerritoryCode,
  zoom: defaulted(CoerceNumberMinMax(integer(), 0, 8), 5),
  month: optional(Month),
  trimester: optional(Trimester),
  semester: optional(Semester),
});

export type Location = Infer<typeof Location>;
