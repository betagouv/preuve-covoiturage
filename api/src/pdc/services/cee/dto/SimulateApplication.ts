import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { IdentityKey, Phone } from "@/pdc/providers/superstruct/shared/index.ts";
import { DrivingLicenseId, JourneyType, LastNameTrunc } from "./shared.ts";
export const SimulateApplication = object({
  driving_license: optional(DrivingLicenseId),
  identity_key: optional(IdentityKey),
  last_name_trunc: LastNameTrunc,
  phone_trunc: Phone,
  journey_type: JourneyType,
});
export type SimulateApplication = Infer<typeof SimulateApplication>;
