import { coerce, date, integer, pattern, size, string } from "@/lib/superstruct/index.ts";

export const Serial = size(integer(), 0, 2147483647);
export const Timestamp = coerce(
  date(),
  pattern(string(), /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/),
  (v) => new Date(v),
);

export { Tz } from "./tz.ts";
