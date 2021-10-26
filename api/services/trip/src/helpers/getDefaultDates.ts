export function getDefaultEndDate(): Date {
  const defaultEndDate = new Date();
  return endOfPreviousMonth(defaultEndDate);
}

export function endOfPreviousMonth(date: Date = new Date()): Date {
  date.setDate(1);
  date.setHours(0, 0, 0, -1);
  return date;
}

export function endOfMonth(date: Date = new Date()): Date {
  const endOfMonth: Date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  endOfMonth.setHours(0, 0, 0, -1);
  return endOfMonth;
}

export function startOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
