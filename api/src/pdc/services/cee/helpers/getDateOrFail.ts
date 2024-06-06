import { InvalidParamsException } from '@/ilos/common/index.ts';
import { date } from "@/deps.ts";

export function getDateOrFail(data: any, message: string): Date {
  const dateData = new Date(data);
  if (!date.isValid(dateData)) {
    throw new InvalidParamsException(message);
  }
  return dateData;
}
