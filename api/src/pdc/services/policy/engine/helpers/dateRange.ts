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
  if (r.length === 0) {
    throw new Error("At least one date is required");
  }

  const range = r
    .map((d) => {
      const date = typeof d === "string" ? new Date(d) : d;
      if (isNaN(date.getTime())) {
        throw new Error("Invalid Date");
      }
      date.setHours(0, 0, 0, 0);
      return date;
    })
    .sort((a, b) => a.getTime() - b.getTime());

  const start = new Date(range[0]);
  const end = range[range.length - 1];
  const dates: string[] = [];

  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
}
