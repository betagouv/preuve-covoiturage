/**
 * Generate a list of dates between two dates
 *
 * @example
 * const boosterDates = [
 *  ...dateRange("2022-01-01", "2022-01-03"),
 * ];
 *
 * @param dates
 * @returns
 */
export function dateRange(...dates: Array<Date | string>): string[] {
  if (dates.length === 0) {
    throw new Error("At least one date is required");
  }

  const [first, ...rest] = castAndSort(dates);
  const last = rest.pop();

  return last ? fill(first, last) : [format(first)];
}

function castAndSort(range: Array<Date | string>): Set<Date> {
  return range
    .map((d) => {
      const date = typeof d === "string" ? new Date(d) : d;
      if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid Date`);
      }
      date.setHours(0, 0, 0, 0);
      return date;
    })
    .sort((a, b) => a.getTime() - b.getTime())
    .reduce((acc, d) => {
      acc.add(d);
      return acc;
    }, new Set<Date>());
}

function format(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fill(first: Date, last: Date): Array<string> {
  const dates = new Set<string>();
  let d;
  for (d = first; d <= last; d.setDate(d.getDate() + 1)) {
    dates.add(format(d));
  }

  return [...dates];
}
