import { difference } from "@/deps.ts";

export function differenceInHours(d1: Date, d2: Date): number {
  return difference(d1, d2, { units: ["hours"] }).hours || 0;
}

export function addMinutes(d1: Date, nb: number): Date {
  return new Date(d1.valueOf() + nb * 60 * 1000);
}
