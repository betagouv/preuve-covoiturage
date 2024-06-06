import { datetz } from "@/deps.ts";

export function endOfMonth(date: Date = new Date(), tz?: string): Date {
  const endOfMonth: Date = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, -1);
  return tz ? datetz.fromZonedTime(endOfMonth, tz) : endOfMonth;
}

export function startOfMonth(date: Date = new Date(), tz?: string): Date {
  const startOfMonth: Date = new Date(date.getFullYear(), date.getMonth(), 1);
  return tz ? datetz.fromZonedTime(startOfMonth, tz) : startOfMonth;
}

export function endOfPreviousMonthDate(tz?: string): Date {
  const defaultEndDate = new Date();
  defaultEndDate.setDate(1);
  defaultEndDate.setHours(0, 0, 0, -1);
  return tz ? datetz.fromZonedTime(defaultEndDate, tz) : defaultEndDate;
}

export function startOfPreviousMonthDate(endDate: Date, tz?: string): Date {
  const startDate = new Date(endDate.valueOf());
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
  return tz ? datetz.fromZonedTime(startDate, tz) : startDate;
}
