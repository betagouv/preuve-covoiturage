import { InvalidParamsException } from "@/ilos/common/index.ts";
import { isValid } from "dep:date-fns";

export function getDateOrFail(data: any, message: string): Date {
  const dateData = new Date(data);
  if (!isValid(dateData)) {
    throw new InvalidParamsException(message);
  }
  return dateData;
}
