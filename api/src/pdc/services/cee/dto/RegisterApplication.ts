import { Infer, literal, object, union } from "@/lib/superstruct/index.ts";
import { IdentityKey, Phone } from "@/pdc/providers/superstruct/shared/index.ts";
import { ExternalId, Timestamp } from "@/pdc/services/acquisition/dto/shared.ts";
import { DrivingLicenseId, LastNameTrunc } from "./shared.ts";
export const RegisterApplication = union([
  object({
    application_timestamp: Timestamp,
    journey_type: literal("long"),
    driving_license: DrivingLicenseId,
    last_name_trunc: LastNameTrunc,
    identity_key: IdentityKey,
    datetime: Timestamp,
    phone_trunc: Phone,
  }),
  object({
    application_timestamp: Timestamp,
    journey_type: literal("short"),
    driving_license: DrivingLicenseId,
    last_name_trunc: LastNameTrunc,
    identity_key: IdentityKey,
    operator_journey_id: ExternalId,
  }),
]);
export type RegisterApplication = Infer<typeof RegisterApplication>;
