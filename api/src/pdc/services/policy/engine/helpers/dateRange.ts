/**
 * Generate a list of dates between two dates
 *
 * @example
 * const boosterDates = [
 *  ...dateRange("2022-01-01", "2022-01-03"),
 * ];
 *
 * @param r
 * @returns
 */
export function dateRange(...r: Array<Date | string>): string[] {
  const range = r
    .map((d) => (typeof d === "string" ? new Date(d) : d))
    .sort((a, b) => a.getTime() - b.getTime());
  const dates: string[] = [];

  const currentDate = range[0];
  while (currentDate <= range[range.length - 1]) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates.map((date) => date.slice(0, 10));
}
