import { Format } from "@/pdc/providers/validator/index.ts";
import { isValidBIC } from "dep:ibantools";

export const bicCustomFormat: Format = (data: string): boolean => {
  return isValidBIC(data);
};
