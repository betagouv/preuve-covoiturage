import { isValidDate } from "@/deps.ts";
import { InvalidParamsException } from "@/ilos/common/index.ts";

export function getDateOrFail(data: any, message: string): Date {
  const dateData = new Date(data);
  if (!isValidDate(dateData)) {
    throw new InvalidParamsException(message);
  }
  return dateData;
}
