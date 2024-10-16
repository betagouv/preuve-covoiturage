import { Format } from "@/ilos/validator/index.ts";
import { isValidIBAN } from "@/deps.ts";

export const ibanCustomFormat: Format = (data: string): boolean => {
  return isValidIBAN(data);
};
