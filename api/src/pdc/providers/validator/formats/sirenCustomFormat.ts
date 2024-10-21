import { Format } from "@/pdc/providers/validator/index.ts";

export const sirenCustomFormat: Format = (data: string): boolean => {
  return /^[0-9]{9}$/.test(data);
};
