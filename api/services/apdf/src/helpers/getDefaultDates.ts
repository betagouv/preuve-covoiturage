import { zonedTimeToUtc } from 'date-fns-tz';

export function endOfPreviousMonthDate(tz?: string): Date {
  const defaultEndDate = new Date();
  defaultEndDate.setDate(1);
  defaultEndDate.setHours(0, 0, 0, -1);
  return tz ? zonedTimeToUtc(defaultEndDate, tz) : defaultEndDate;
}

export function startOfPreviousMonthDate(endDate: Date, tz?: string): Date {
  const startDate = new Date(endDate.valueOf());
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
  return tz ? zonedTimeToUtc(startDate, tz) : startDate;
}
