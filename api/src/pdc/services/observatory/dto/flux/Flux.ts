import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import {
  Month,
  Semester,
  TerritoryCode,
  TerritoryType,
  Trimester,
  Year,
} from "@/pdc/providers/superstruct/shared/index.ts";

export const Flux = object({
  year: Year,
  type: TerritoryType,
  observe: TerritoryType,
  code: TerritoryCode,
  month: optional(Month),
  trimester: optional(Trimester),
  semester: optional(Semester),
});

export type Flux = Infer<typeof Flux>;
