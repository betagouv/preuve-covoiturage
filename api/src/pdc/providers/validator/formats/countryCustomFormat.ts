import { Format } from "@/pdc/providers/validator/index.ts";

export const countryCustomFormat: Format = (data: string): boolean => {
  try {
    // TODO check against a real list of INSEE codes?

    return /^[0-9X]{5}$/.test(data);
  } catch (e) {
    return false;
  }
};
