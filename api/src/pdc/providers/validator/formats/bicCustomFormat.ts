import { isValidBIC } from "@/deps.ts";
import { Format } from "@/pdc/providers/validator/index.ts";

export const bicCustomFormat: Format = (data: string): boolean => {
  return isValidBIC(data);
};
