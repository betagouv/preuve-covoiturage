import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import {
  Direction,
  Month,
  Semester,
  TerritoryCode,
  TerritoryType,
  Trimester,
  Year,
} from "@/pdc/providers/superstruct/shared/index.ts";

export const Occupation = object({
  year: Year,
  type: TerritoryType,
  observe: TerritoryType,
  code: TerritoryCode,
  direction: optional(Direction),
  month: optional(Month),
  trimester: optional(Trimester),
  semester: optional(Semester),
});

export type Occupation = Infer<typeof Occupation>;
