import { coerce, date, enums, integer, pattern, size, string } from "@/lib/superstruct/index.ts";

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
