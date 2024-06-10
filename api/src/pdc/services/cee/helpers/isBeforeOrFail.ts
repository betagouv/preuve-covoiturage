import { InvalidParamsException } from "@/ilos/common/index.ts";
import { date as d } from "@/deps.ts";
export function isBeforeOrFail(date: Date, days: number): void {
  if (!d.isBefore(date, d.sub(new Date(), { days }))) {
    throw new InvalidParamsException(
      `Date should be before ${days} days from now`,
    );
  }
}

export function isBetweenOrFail(date: Date, start: Date, end: Date): void {
  if (!d.isBefore(date, end) || !d.isAfter(date, start)) {
    throw new InvalidParamsException(
      `Date should be before between ${start.toISOString()} and ${end.toISOString()}`,
    );
  }
}
