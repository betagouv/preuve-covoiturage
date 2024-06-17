import { isAfter, isBefore, sub } from "@/deps.ts";
import { InvalidParamsException } from "@/ilos/common/index.ts";
export function isBeforeOrFail(date: Date, days: number): void {
  if (!isBefore(date, sub(new Date(), { days }))) {
    throw new InvalidParamsException(
      `Date should be before ${days} days from now`,
    );
  }
}

export function isBetweenOrFail(date: Date, start: Date, end: Date): void {
  if (!isBefore(date, end) || !isAfter(date, start)) {
    throw new InvalidParamsException(
      `Date should be before between ${start.toISOString()} and ${end.toISOString()}`,
    );
  }
}
