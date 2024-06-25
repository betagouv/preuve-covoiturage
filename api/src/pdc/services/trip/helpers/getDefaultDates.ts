import { fromZonedTime } from "@/deps.ts";

/**
 * @deprecated Move to dates.helper.ts
 */
export function endOfMonth(date: Date = new Date(), tz?: string): Date {
  const endOfMonth: Date = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1,
    0,
    0,
    0,
    -1,
  );
  return tz ? fromZonedTime(endOfMonth, tz) : endOfMonth;
}

/**
 * @deprecated Move to dates.helper.ts
 */
export function startOfMonth(date: Date = new Date(), tz?: string): Date {
  const startOfMonth: Date = new Date(date.getFullYear(), date.getMonth(), 1);
  return tz ? fromZonedTime(startOfMonth, tz) : startOfMonth;
}

/**
 * @deprecated Move to dates.helper.ts
 */
export function endOfPreviousMonthDate(tz?: string): Date {
  const defaultEndDate = new Date();
  defaultEndDate.setDate(1);
  defaultEndDate.setHours(0, 0, 0, -1);
  return tz ? fromZonedTime(defaultEndDate, tz) : defaultEndDate;
}

/**
 * @deprecated Move to dates.helper.ts
 */
export function startOfPreviousMonthDate(endDate: Date, tz?: string): Date {
  const startDate = new Date(endDate.valueOf());
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
  return tz ? fromZonedTime(startDate, tz) : startDate;
}
