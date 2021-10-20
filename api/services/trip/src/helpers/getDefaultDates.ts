export function getDefaultEndDate(): Date {
  const defaultEndDate = new Date();
  defaultEndDate.setDate(1);
  defaultEndDate.setHours(0, 0, 0, -1);
  return defaultEndDate;
}
