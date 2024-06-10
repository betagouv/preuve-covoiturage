import { formatPhoneTrunc } from "../../lib/phone.ts";

export function phonetruncCast(data: string): string {
  return formatPhoneTrunc(data);
}
