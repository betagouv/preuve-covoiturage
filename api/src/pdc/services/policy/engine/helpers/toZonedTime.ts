import { defaultTimezone } from "@/config/time.ts";
import { FormatOptionsWithTZ, toZonedTime as originalToZoneTime } from "dep:date-fns-tz";

/**
 * @deprecated Move to dates.helper.ts
 *
 * @param date
 * @param timeZone
 * @param options
 * @returns
 */
export function toZonedTime(
  date: Date | string | number,
  timeZone: string = defaultTimezone,
  options?: FormatOptionsWithTZ,
): Date {
  return originalToZoneTime(date, timeZone, options);
}
