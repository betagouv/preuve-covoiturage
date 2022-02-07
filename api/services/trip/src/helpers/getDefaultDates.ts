import { utcToZonedTime } from 'date-fns-tz';

export function endOfMonth(date: Date = new Date(), tz?: string): Date {
  const endOfMonth: Date = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, -1);
  return tz ? utcToZonedTime(endOfMonth, tz) : endOfMonth;
}

export function startOfMonth(date: Date = new Date(), tz?: string): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfPreviousMonthDate(tz?: string): Date {
  const defaultEndDate = new Date();
  defaultEndDate.setDate(1);
  defaultEndDate.setHours(0, 0, 0, -1);
  return tz ? utcToZonedTime(defaultEndDate, tz) : defaultEndDate;
}

export function startOfPreviousMonthDate(endDate: Date, tz?: string): Date {
  const startDate = new Date(endDate.valueOf());
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
  return tz ? utcToZonedTime(startDate, tz) : startDate;
}
