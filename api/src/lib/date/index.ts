import { difference } from "@/deps.ts";

export function differenceInHours(d1: Date, d2: Date): number {
  return difference(d1, d2, { units: ["hours"] }).hours || 0;
}
