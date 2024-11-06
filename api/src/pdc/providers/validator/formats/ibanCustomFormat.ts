import { isValidIBAN } from "@/deps.ts";
import { Format } from "@/pdc/providers/validator/index.ts";

export const ibanCustomFormat: Format = (data: string): boolean => {
  return isValidIBAN(data);
};
