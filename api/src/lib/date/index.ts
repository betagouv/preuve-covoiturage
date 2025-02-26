import { difference } from "dep:datetime";

export function differenceInHours(d1: Date, d2: Date): number {
  return (difference(d1, d2).milliseconds || 0) / 3600000;
}

export function addMinutes(d1: Date, nb: number): Date {
  return new Date(d1.valueOf() + nb * 60 * 1000);
}
