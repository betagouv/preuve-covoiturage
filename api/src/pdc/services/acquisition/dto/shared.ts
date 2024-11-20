import {
  boolean,
  enums,
  integer,
  max,
  number,
  object,
  optional,
  pattern,
  size,
  string,
} from "@/lib/superstruct/index.ts";
import { Timestamp } from "@/pdc/providers/superstruct/shared/index.ts";
export { Serial } from "@/pdc/providers/superstruct/shared/index.ts";
export { Timestamp };

export const Lat = size(number(), -90, 90);
export const Lon = size(number(), -180, 180);
export const Siret = size(string(), 14, 14);
export const Amount = size(number(), 0, 100_000);
export const IdentityKey = pattern(string(), /^[a-f0-9]{64}$/);
export const Varchar = size(string(), 0, 256);
export const Email = pattern(
  Varchar,
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/,
);
export const Phone = pattern(Varchar, /^\+[0-9]*$/);
export const ExternalId = pattern(string(), /^[0-9A-Za-z_-]{1,256}$/);
export const OperatorJourneyId = ExternalId;
export const OperatorClass = enums(["A", "B", "C"]);

export const Distance = size(integer(), 0, 1_000_000);

export const TimeGeoPoint = object({
  datetime: Timestamp,
  lat: Lat,
  lon: Lon,
});

export const Identity = object({
  identity_key: IdentityKey,
  operator_user_id: ExternalId,
  firstname: optional(Varchar),
  lastanme: optional(Varchar),
  email: optional(Email),
  phone: optional(Phone),
  phone_trunc: optional(Phone),
  company: optional(Varchar),
  over_18: optional(boolean()),
});

export const JourneyStatus = enums([
  "acquisition_error",
  "validation_error",
  "normalization_error",
  "fraud_error",
  "anomaly_error",
  "ok",
  "expired",
  "canceled",
  "pending",
  "unknown",
]);

export const Incentive = object({
  index: size(integer(), 0, 19),
  siret: Siret,
  amount: Amount,
});

export const Limit = size(integer(), 0, 100);
export const Offset = max(integer(), 0);
