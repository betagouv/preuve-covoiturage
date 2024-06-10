import { datetz } from "@/deps.ts";

const defaultTz = "Europe/Paris";

export function toZonedTime(
  date: Date | string | number,
  timeZone: string = defaultTz,
  options?: datetz.FormatOptionsWithTZ,
): Date {
  return datetz.toZonedTime(date, timeZone, options);
}
