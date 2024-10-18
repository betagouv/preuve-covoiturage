import { Format } from "@/pdc/providers/validator/index.ts";

export const nicCustomFormat: Format = (data: string): boolean => {
  return /^[0-9]{5}$/.test(data);
};
