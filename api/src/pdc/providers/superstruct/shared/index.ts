import { coerce, date, enums, integer, pattern, refine, size, string, union } from "@/lib/superstruct/index.ts";

export const Serial = size(integer(), 0, 2147483647);
export const DateOnly = coerce(
  date(),
  pattern(string(), /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
  (v) => new Date(v).toISOString().split("T")[0],
);

export const Timestamp = coerce(
  date(),
  pattern(string(), /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/),
  (v) => new Date(v),
);
export const Varchar = size(string(), 0, 256);

export const Uuid = pattern(
  string(),
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
);

export const Phone = pattern(Varchar, /^\+[0-9]{6,20}$/);

export const IdentityKey = pattern(string(), /^[a-f0-9]{64}$/);
export const Direction = enums(["from", "to", "both"]);
export const Year = size(integer(), 2020, new Date().getFullYear());
export const Id = coerce(Serial, string(), (v) => Math.abs(parseInt(v, 10)));
export const Month = coerce(
  refine(integer(), "Month", (v) => v >= 1 && v <= 12),
  string(),
  (v) => parseInt(v, 10),
);
export const Trimester = coerce(
  refine(integer(), "Trimester", (v) => v >= 1 && v <= 4),
  string(),
  (v) => parseInt(v, 10),
);
export const Semester = coerce(
  refine(integer(), "Semester", (v) => v >= 1 && v <= 2),
  string(),
  (v) => parseInt(v, 10),
);
export const Country = pattern(string(), /^[0-9X]{5}$/);
export const Department = pattern(string(), /^[0-9][0-9A-B]{1}[0-9]{0,1}$/);
export const Insee = pattern(string(), /^[0-9][0-9A-B][0-9]{3}$/);
export const Siren = pattern(string(), /^[0-9]{9}$/);
export const TerritoryCode = union([Country, Department, Insee, Siren]);
