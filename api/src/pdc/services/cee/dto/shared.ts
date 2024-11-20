import { enums, pattern, string, union } from "@/lib/superstruct/index.ts";

export const JourneyType = enums(["short", "long"]);
export const CeeApplicationType = enums(["specific", "standardized"]);
export const LastNameTrunc = pattern(string(), /^[A-Z ]{3}$/);
export const DrivingLicenseId = union([
  pattern(string(), /^[0-9]{12}$/),
  pattern(string(), /^[A-Z0-9]{1,15}[0-9]{4}$/),
  pattern(string(), /^[A-Z0-9]{1,15}$/),
  pattern(string(), /^99-.*$/),
]);
