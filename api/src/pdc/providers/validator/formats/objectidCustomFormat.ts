import { Format } from "@/pdc/providers/validator/index.ts";

export const objectidCustomFormat: Format = (data: string): boolean => {
  return /^[a-f\d]{24}$/i.test(data);
};
