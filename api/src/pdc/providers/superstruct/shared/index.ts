import {
  coerce,
  date,
  enums,
  integer,
  nullable,
  pattern,
  size,
  string,
  Struct,
  union,
} from "@/lib/superstruct/index.ts";
export const CoerceNumberMinMax = (type: Struct<number, null>, min: number, max: number) => {
  return coerce(size(type, min, max), string(), (v) => {
    const parsed = parseInt(v, 10);
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid number: "${v}"`);
    }
    if (parsed < 0) {
      throw new Error(`Expected non-negative number, got: "${v}"`);
    }
    return parsed;
  });
};
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
export const Email = pattern(Varchar, /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
export const Phone = pattern(Varchar, /^\+[0-9]{6,20}$/);
export const Role = enums([
  "registry.admin",
  "operator.user",
  "operator.admin",
  "territory.user",
  "territory.admin",
  "application.admin",
]);
export const IdentityKey = pattern(string(), /^[a-f0-9]{64}$/);
export const Direction = enums(["from", "to", "both"]);
export const Year = CoerceNumberMinMax(integer(), 2020, new Date().getFullYear());
export const Id = CoerceNumberMinMax(integer(), 0, 2147483647);
export const NullableId = nullable(Id);
export const Month = CoerceNumberMinMax(integer(), 1, 12);
export const Trimester = CoerceNumberMinMax(integer(), 1, 4);
export const Semester = CoerceNumberMinMax(integer(), 1, 2);
export const Country = pattern(string(), /^[0-9X]{5}$/);
export const Department = pattern(string(), /^[0-9][0-9A-B]{1}[0-9]{0,1}$/);
export const Insee = pattern(string(), /^[0-9][0-9A-B][0-9]{3}$/);
export const Siren = pattern(string(), /^[0-9]{9}$/);
export const Siret = pattern(string(), /^[0-9]{14}$/);
export const TerritoryCode = union([Country, Department, Insee, Siren]);
export const TerritoryType = enums(["com", "epci", "aom", "dep", "reg", "country"]);
