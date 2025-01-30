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

export const Incentive = object({
  year: Year,
  type: TerritoryType,
  code: TerritoryCode,
  month: optional(Month),
  trimester: optional(Trimester),
  semester: optional(Semester),
  direction: optional(Direction),
});

export type Incentive = Infer<typeof Incentive>;
