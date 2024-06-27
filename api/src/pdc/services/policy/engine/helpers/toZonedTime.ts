import {
  FormatOptionsWithTZ,
  toZonedTime as originalToZoneTime,
} from "@/deps.ts";

const defaultTz = "Europe/Paris";

export function toZonedTime(
  date: Date | string | number,
  timeZone: string = defaultTz,
  options?: FormatOptionsWithTZ,
): Date {
  return originalToZoneTime(date, timeZone, options);
}
