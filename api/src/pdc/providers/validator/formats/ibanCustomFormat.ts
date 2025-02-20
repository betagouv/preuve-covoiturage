import { Format } from "@/pdc/providers/validator/index.ts";
import { isValidIBAN } from "dep:ibantools";

export const ibanCustomFormat: Format = (data: string): boolean => {
  return isValidIBAN(data);
};
