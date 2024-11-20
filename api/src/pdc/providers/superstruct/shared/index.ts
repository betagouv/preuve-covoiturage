import { coerce, date, integer, pattern, size, string } from "@/lib/superstruct/index.ts";
export { Tz } from "./tz.ts";

export const Serial = size(integer(), 0, 2147483647);
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

export const Phone = pattern(Varchar, /^\+[0-9]*$/);

export const IdentityKey = pattern(string(), /^[a-f0-9]{64}$/);
